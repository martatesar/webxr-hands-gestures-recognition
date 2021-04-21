import { Vector3 } from "three";
import IUpdatable from "../../common/IUpdatable";
import { OCHand } from "../core/OCHand";
import downloadAsJsonFile from '../../helpers/downloadAsJsonFile';

export class HandsGestureLearner implements IUpdatable {
  learnHand: OCHand; // learning gestures
  controlHand: OCHand; // controlling learning proces with pinch
  wantSaveGesture: boolean;

  constructor(learnHand: OCHand, controlHand: OCHand) {
    this.controlHand = controlHand;
    this.learnHand = learnHand;
    this.wantSaveGesture = false;
    this.controlHand.controllable.addEventListener("pinchstart", () =>
      this.onControlHandPinchStart()
    );
    this.controlHand.controllable.addEventListener("pinchend", () =>
      this.onControlHandPinchEnd()
    );
  }

  onControlHandPinchEnd(): void {
    console.log("pinch end");
    this.wantSaveGesture = true;
  }

  onControlHandPinchStart(): void {
    console.log("pinch start");
  }

  helperVector = new Vector3();
  resultGesture: any = {};
  update(): void {
    if (!this.learnHand.jointsLoaded) return;
    if (!this.controlHand.jointsLoaded) return;
    // console.log("update")
    if (this.wantSaveGesture) {
      const joints = this.learnHand.controllable.joints;
      for (const key in joints) {
        joints[key].getWorldPosition(this.helperVector);

        this.resultGesture[key] = joints["wrist"]
          .worldToLocal(this.helperVector)
          .clone();
      }
      console.log("SAVE THIS AS JSON TO FILE TO GESTURES TEMPLATES")
      console.log(JSON.stringify(this.resultGesture));
      // downloadAsJsonFile(this.resultGesture, "new.gesture.json");

      this.wantSaveGesture = false;
    }
  }

  public static create(learnHand: OCHand, controlHand: OCHand) {
    return new HandsGestureLearner(learnHand, controlHand);
  }
}
