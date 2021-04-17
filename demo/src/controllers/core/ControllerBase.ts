import { Group, WebGLRenderer } from "three";

export enum ControllerType {
    Right = 0,
    Left = 1,
  }
  
  export class Controllable extends Group {
    joints: any;
  }
  
  export abstract class ControllerBase {
    renderer: WebGLRenderer;
    controllable: Controllable;
    controllerType: ControllerType;
  
    constructor(renderer: WebGLRenderer, controllerType: ControllerType) {
      this.renderer = renderer;
      this.controllerType = controllerType;
    }
  }