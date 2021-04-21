import { XRControllerModelFactory } from "three/examples/jsm/webxr/XRControllerModelFactory.js";
import * as CANNON from "cannon-es";
import { XRHandModelFactory } from "three/examples/jsm/webxr/XRHandModelFactory.js";
import { WebGLRenderer } from "three";
import { Object3D } from "three";
import { HandGestureRecognition } from "./features/handGestureRecognization/HandGestureRecognition";
import { OCHand } from "./core/OCHand";
import { HandsPhysic } from "./features/HandsPhysic";
import { OCController } from "./core/OCControler";
import { ControllerType } from "./core/ControllerBase";
import { HandsGestureLearner } from "./features/HandsGestureLearner";
import HandGestureRecognizer from "./features/HandsGestureRecognizer";
import IUpdatable from "../common/IUpdatable";

export enum EControllerFeatures {
  Basic = 0,
  PhysicRight = 1 << 0, // enable physics on right hand
  PhysicLeft = 1 << 1,
  RecognitionRight = 1 << 2, // enable gesture recognition on right hand
  RecognitionLeft = 1 << 3,
  LearnRecognitionRight = 1 << 4, // enable learning on right hand, confirmation by left hand (pinch)
  LearnRecognitionLeft = 1 << 5,
}

export class Controllers implements IUpdatable {
  hands: { left?: OCHand; right?: OCHand };
  handsPhysic: { left?: HandsPhysic; right?: HandsPhysic };
  controllers: { left?: OCController; right?: OCController };

  gestureLearner: { left?: HandsGestureLearner; right?: HandsGestureLearner };
  gestureRecognizer: {
    left?: HandGestureRecognizer;
    right?: HandGestureRecognizer;
  };

  enabledFeatures: EControllerFeatures;

  world: CANNON.World;
  renderer: WebGLRenderer;
  scene: THREE.Scene;

  updatables: IUpdatable[];

  private constructor(
    renderer: WebGLRenderer,
    world: CANNON.World,
    scene: THREE.Scene,
    enabledFeatures: EControllerFeatures
  ) {
    this.world = world;
    this.renderer = renderer;
    this.scene = scene;
    this.handsPhysic = {};
    this.hands = {};
    this.updatables = [];
    this.controllers = {};
    this.gestureRecognizer = {};
    this.gestureLearner = {};
    this.enabledFeatures = enabledFeatures;
    this.InitializeHands();
    // this.InitializeControllers(renderer);
  }

  update(): void {
    this.updatables.forEach((u) => u.update());
  }

  hasFeature(feature: EControllerFeatures): boolean {
    return feature === (this.enabledFeatures & feature);
  }

  private InitializeControllers(renderer: WebGLRenderer) {
    const controllerModelFactory = new XRControllerModelFactory();
    this.controllers.left = OCController.create(
      renderer,
      controllerModelFactory,
      ControllerType.Left
    );

    this.controllers.right = OCController.create(
      renderer,
      controllerModelFactory,
      ControllerType.Right
    );

    this.scene.add(this.controllers.left.controllable);
    this.scene.add(this.controllers.right.controllable);
  }

  private InitializeHands() {
    const handModelFactory = new XRHandModelFactory().setPath("./models/");

    this.hands.left = OCHand.create(
      this.renderer,
      handModelFactory,
      ControllerType.Left
    );
    this.hands.right = OCHand.create(
      this.renderer,
      handModelFactory,
      ControllerType.Right
    );

    this.scene.add(this.hands.left.controllable);
    this.scene.add(this.hands.right.controllable);

    this.enablePhysicsIfNeeded();
    this.enableLearnRecognitionIfNeeded();
    this.enableRecognitionIfNeeded();
  }

  private enableRecognitionIfNeeded() {
    if (
      this.hasFeature(EControllerFeatures.RecognitionLeft) &&
      this.hands.left != null
    ) {
      this.gestureRecognizer.left = HandGestureRecognizer.create(
        this.hands.left,
        HandGestureRecognition.CreateDefault(ControllerType.Left)
      );
      this.addToUpdatables(this.gestureRecognizer.left);
    }

    if (
      this.hasFeature(EControllerFeatures.RecognitionRight) &&
      this.hands.right != null
    ) {
      this.gestureRecognizer.right = HandGestureRecognizer.create(
        this.hands.right,
        HandGestureRecognition.CreateDefault(ControllerType.Right)
      );
      this.addToUpdatables(this.gestureRecognizer.right);
    }
  }

  private enableLearnRecognitionIfNeeded() {
    if (this.hands.left == null) return;
    if (this.hands.right == null) return;

    if (this.hasFeature(EControllerFeatures.LearnRecognitionLeft)) {
      this.gestureLearner.left = HandsGestureLearner.create(
        this.hands.left,
        this.hands.right
      );
      this.addToUpdatables(this.gestureLearner.left);
    }

    if (this.hasFeature(EControllerFeatures.LearnRecognitionRight)) {
      this.gestureLearner.right = HandsGestureLearner.create(
        this.hands.right,
        this.hands.left
      );
      this.addToUpdatables(this.gestureLearner.right);
    }
  }

  private enablePhysicsIfNeeded() {
    if (this.hasFeature(EControllerFeatures.PhysicLeft) && this.hands.left) {
      this.handsPhysic.left = HandsPhysic.Create(this.hands.left, this.world);
      this.addToUpdatables(this.handsPhysic.left);
    }

    if (this.hasFeature(EControllerFeatures.PhysicRight) && this.hands.right) {
      this.handsPhysic.right = HandsPhysic.Create(this.hands.right, this.world);
      this.addToUpdatables(this.handsPhysic.right);
    }
  }

  private addToUpdatables(updatable: IUpdatable) {
    this.updatables = [...this.updatables, updatable];
  }

  public static create(
    renderer: WebGLRenderer,
    world: CANNON.World,
    scene: THREE.Scene,
    features: EControllerFeatures
  ) {
    return new Controllers(renderer, world, scene, features);
  }
}
