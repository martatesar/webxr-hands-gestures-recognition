import {
  WebGLRenderer, Scene, PerspectiveCamera
} from "three";
import IUpdatable from "./IUpdatable";

export class BaseScene implements IUpdatable {
  scene: Scene;
  renderer: WebGLRenderer;
  camera: PerspectiveCamera;

  resizeHandler: any;

  initialize(parentElement: HTMLElement) {
    parentElement.appendChild(this.renderer.domElement);

    this.renderer.setAnimationLoop(() => this.update());
    this.resizeHandler = () => this.onWindowResize();
    window.addEventListener("resize", this.resizeHandler);
  }

  update(): void {}

  release() {
     window.removeEventListener("resize", this.resizeHandler);
  }

  onWindowResize() : any {
    console.log("resize");
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
