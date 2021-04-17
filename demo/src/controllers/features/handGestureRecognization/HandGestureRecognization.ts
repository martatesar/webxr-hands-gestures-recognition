import { Vector3 } from "three";
import { ControllerType } from "../../core/ControllerBase";
import okLeft from "./gestureTemplates/okLeft.gesture.json";
import oneLeft from "./gestureTemplates/oneLeft.gesture.json";
import twoLeft from "./gestureTemplates/twoLeft.gesture.json";
import threeLeft from "./gestureTemplates/threeLeft.gesture.json";
import fistLeft from "./gestureTemplates/fistLeft.gesture.json";
import fiveLeft from "./gestureTemplates/fiveLeft.gesture.json";
import fourLeft from "./gestureTemplates/fourLeft.gesture.json";
import victoryRight from "./gestureTemplates/victoryRight.gesture.json";
import spockRight from "./gestureTemplates/spockRight.gesture.json";
import rockRight from "./gestureTemplates/rockRight.gesture.json";
import fistRight from "./gestureTemplates/fistRight.gesture.json";
import okRight from "./gestureTemplates/okRight.gesture.json";
import fuckRight from "./gestureTemplates/fuckRight.gesture.json";

export interface IGestureTemplateData {
  [index: string]: { x: number; y: number; z: number } | string;
}

export interface IRecognizeOptions {
  maxJointDistanceThreshold: number;
}

export interface IGestureTemplate {
  name: string;
  data: IGestureTemplateData;
}

export interface IRecognitionResult {
  isRecognized: boolean;
  gesture: string | null;
}

export class HandGestureRecognization {
  gestureDatabase: Array<IGestureTemplate>;
  options: IRecognizeOptions;

  private constructor(
    gestureDatabase: Array<IGestureTemplate>,
    options: IRecognizeOptions
  ) {
    this.gestureDatabase = gestureDatabase;
    this.options = options;
  }

  recognizeGesture(joints: any): IRecognitionResult {
    let helperVector = new Vector3();
    for (const gesture of this.gestureDatabase) {
      let recognized = true;
      for (const key in gesture.data) {
        if (key == "wrist") continue;

        joints[key].getWorldPosition(helperVector);
        joints["wrist"].worldToLocal(helperVector);

        if (
          helperVector.distanceTo(gesture.data[key] as Vector3) >
          this.options.maxJointDistanceThreshold
        ) {
          recognized = false;
          break;
        } else {
          // console.log("subrecognized:" + key);
        }
      }

      if (recognized) {
        return { isRecognized: true, gesture: gesture.name };
      }
    }
    return { isRecognized: false, gesture: null };
  }

  public static CreateDefault(type: ControllerType) {
    const leftDatabase: IGestureTemplate[] = [
      { name: "one", data: oneLeft },
      { name: "two", data: twoLeft },
      { name: "three", data: threeLeft },
      { name: "four", data: fourLeft },
      { name: "five", data: fiveLeft },
    ];

    const rightDatabase: IGestureTemplate[] = [
      { name: "victory", data: victoryRight },
      { name: "fuck", data: fuckRight },
      // { name: "spock", data: spockRight },
      { name: "ok", data: okRight },
      { name: "rock", data: rockRight },
      { name: "fist", data: fistRight },
    ];

    return new HandGestureRecognization(
      type == ControllerType.Left ? leftDatabase : rightDatabase,
      { maxJointDistanceThreshold: 0.06 }
    );
  }
}
