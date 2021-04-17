import { WebGLRenderer } from "three";
import { XRHandModelFactory } from "three/examples/jsm/webxr/XRHandModelFactory";
import { Controllable, ControllerBase, ControllerType } from "./ControllerBase";

export class OCHand extends ControllerBase {
    private constructor(
      renderer: WebGLRenderer,
      handModelFactory: XRHandModelFactory,
      handType: ControllerType
    ) {
      super(renderer, handType);
      this.controllable = renderer.xr.getHand(handType) as Controllable;
      this.controllable.add(
        handModelFactory.createHandModel(this.controllable, "boxes")
      );
    }
  
    public get jointsLoaded() {
      return Object.keys(this.controllable.joints).length > 0;
    }
  
    public static create(
      renderer: WebGLRenderer,
      handModelFactory: XRHandModelFactory,
      handType: ControllerType
    ) {
      return new OCHand(renderer, handModelFactory, handType);
    }
  }