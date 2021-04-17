import { WebGLRenderer } from "three";
import { XRControllerModelFactory } from "three/examples/jsm/webxr/XRControllerModelFactory";
import { Controllable, ControllerBase, ControllerType } from "./ControllerBase";

export class OCController extends ControllerBase {
    private constructor(
      renderer: WebGLRenderer,
      controllerModelFactory: XRControllerModelFactory,
      controllerType: ControllerType
    ) {
      super(renderer, controllerType);
      this.controllable = renderer.xr.getController(
        controllerType
      ) as Controllable;
      this.controllable.add(
        controllerModelFactory.createControllerModel(this.controllable)
      );
    }
    static create(
      renderer: WebGLRenderer,
      controllerModelFactory: XRControllerModelFactory,
      type: ControllerType
    ): OCController {
      return new OCController(renderer, controllerModelFactory, type);
    }
  }
  