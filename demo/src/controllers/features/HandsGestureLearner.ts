import { Vector3 } from "three";
import IUpdatable from "../../common/IUpdatable";
import { OCHand } from "../core/OCHand";

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
          // console.log(joints["wrist"].worldToLocal(this.helperVector));
          // if (key == "thumb-tip") console.log("h", this.helperVector);
  
          this.resultGesture[key] = joints["wrist"]
            .worldToLocal(this.helperVector)
            .clone();
          // if (key == "thumb-tip") console.log("h", this.helperVector);
  
          // if (key == "thumb-tip") {
          //   console.log(
          //     joints["wrist"].worldToLocal(
          //       new Vector3().setFromMatrixPosition(joints[key].matrixWorld)
          //     )
          //   );
  
          // if (
          //   joints["wrist"]
          //     .worldToLocal(this.helperVector)
          //     .distanceTo(okGesture[key] as Vector3)
          // );
          if (key == "thumb-tip") {
            // console.log(this.resultGesture[key]);
            // console.log(this.helperVector);
            // console.log("h", this.helperVector);
  
            // console.log(
            //   this.helperVector.distanceTo(
            //     new Vector3(
            //       0.09079425183261969,
            //       -0.027542440950169098,
            //       -0.09830888178031078
            //     )
            //   )
            // );
  
            if (
              this.helperVector.distanceTo(
                new Vector3(
                  0.09079425183261969,
                  -0.027542440950169098,
                  -0.09830888178031078
                )
              ) < 0.02
            ) {
              console.log("up");
            } else {
              console.log("none");
            }
          }
        }
        console.log(JSON.stringify(this.resultGesture));
        this.wantSaveGesture = false;
      }
    }
  
    public static create(learnHand: OCHand, controlHand: OCHand) {
      return new HandsGestureLearner(learnHand, controlHand);
    }
  }