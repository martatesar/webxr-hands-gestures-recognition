import { Vector3 } from "three";
import IUpdatable from "../../common/IUpdatable";
import { HandGestureRecognition } from "./handGestureRecognization/HandGestureRecognition";
import { OCHand } from "../core/OCHand";

export default class HandGestureRecognizer implements IUpdatable {
  hand: OCHand;
  gestureRecognization: HandGestureRecognition;
  _currentRecognizedGesture: string | null;

  constructor(hand: OCHand, gestureRecognization: HandGestureRecognition) {
    this.hand = hand;
    this.gestureRecognization = gestureRecognization;
  }

  helperVector = new Vector3();

  public get currentGesture() {
    return this._currentRecognizedGesture;
  }

  public set currentGesture(gesture: string | null) {
    if (this._currentRecognizedGesture != gesture) {
      // call gesture changed
      this.hand.controllable.dispatchEvent({
        type: "gesture_changed",
        gesture: gesture,
      });
      console.log("gesture", gesture)
    }
    this._currentRecognizedGesture = gesture;
  }

  update(): void {
    if (!this.hand.jointsLoaded) return;
    const joints = this.hand.controllable.joints;

    const {
      isRecognized,
      gesture,
    } = this.gestureRecognization.recognizeGesture(joints);

      this.currentGesture = isRecognized ? gesture : null;
  }

  public static create(hand: OCHand, recognization: HandGestureRecognition) {
    return new HandGestureRecognizer(hand, recognization);
  }
}
