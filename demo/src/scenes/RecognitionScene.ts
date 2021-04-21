import * as CANNON from "cannon-es";

import {
  Clock,
  Color,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
  Scene,
  PerspectiveCamera,
  HemisphereLight,
  DirectionalLight,
  WebGLRenderer,
  sRGBEncoding,
  FontLoader,
  TextGeometry,
  MeshPhongMaterial,
  Font,
} from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import helvetiker_bold from "../resources/helvetiker_bold.typeface.json";

import IUpdatable from "../common/IUpdatable";
import { BaseScene } from "../common/BaseScene";
import { Controllers, EControllerFeatures } from "../controllers/Controllers";

import CannonDebugRenderer from "../helpers/cannonDebugger";

export class RecognitionScene extends BaseScene implements IUpdatable {
  debugRenderer: CannonDebugRenderer;
  world: CANNON.World;
  controllers: Controllers;
  clock: Clock;
  font: Font;
  textMeshes: { [id: string]: Mesh | null };

  initialize(parentElement: HTMLElement) {
    super.initialize(parentElement);

    this.textMeshes = { left: null, right: null };
    let controls = new OrbitControls(this.camera, parentElement);
    controls.target.set(0, 1.6, 0);
    controls.update();

    this.controllers.hands.left?.controllable.addEventListener(
      "gesture_changed",
      (evt) => this.setText(evt.gesture || " ", "left")
    );
    this.controllers.hands.right?.controllable.addEventListener(
      "gesture_changed",
      (evt) => this.setText(evt.gesture || " ", "right")
    );
    this.setText("Hands VR", "right");
  }

  update(): void {
    let delta = this.clock.getDelta();
    if (delta > 0.1) delta = 0.1;
    this.world.step(delta);

    this.controllers.update();
    this.debugRenderer.update();
    this.renderer.render(this.scene, this.camera);
  }

  setText(text: string, id: string): void {
    if (this.textMeshes[id] != null) this.scene.remove(this.textMeshes[id]!);

    let textGeo = new TextGeometry(text, {
      font: this.font,
      size: 0.2,
      height: 0.1,
    });

    textGeo.computeBoundingBox();

    const centerOffset =
      -0.5 * (textGeo.boundingBox!.max.x - textGeo.boundingBox!.min.x);

    let fontMaterials = [
      new MeshPhongMaterial({ color: 0xffffff, flatShading: true }), // front
      new MeshPhongMaterial({ color: 0xffffff }), // side
    ];

    let textHolder = new Mesh(textGeo, fontMaterials);

    textHolder.position.x = centerOffset - (id === "left" ? 0.5 : -0.5);
    textHolder.position.y = 1;
    textHolder.position.z = -2;

    textHolder.rotation.x = 0;
    textHolder.rotation.y = Math.PI * 2;

    textHolder.lookAt(this.camera.position);

    this.textMeshes[id] = textHolder;

    this.scene.add(this.textMeshes[id]!);
  }

  public static create(controllerFeatures: EControllerFeatures) {
    let demoScene = new RecognitionScene();

    let scene = new Scene();
    scene.background = new Color(0x444444);

    let camera = new PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      10
    );

    camera.position.set(0, 1.6, 3);

    // init floor
    const floorGeometry = new PlaneGeometry(4, 4);
    const floorMaterial = new MeshStandardMaterial({ color: 0x222222 });
    const floor = new Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // init lights
    scene.add(new HemisphereLight(0x808080, 0x606060));
    const light = new DirectionalLight(0xffffff);
    light.position.set(0, 6, 0);
    light.castShadow = true;
    light.shadow.camera.top = 2;
    light.shadow.camera.bottom = -2;
    light.shadow.camera.right = 2;
    light.shadow.camera.left = -2;
    light.shadow.mapSize.set(4096, 4096);
    scene.add(light);

    //
    let renderer = new WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = sRGBEncoding;
    renderer.shadowMap.enabled = true;
    renderer.xr.enabled = true;

    let world = new CANNON.World();
    world.gravity.set(0, -0.02, 0);

    // text
    const loader = new FontLoader();
    const font = loader.parse(helvetiker_bold);

    demoScene.font = font;
    demoScene.renderer = renderer;
    demoScene.scene = scene;
    demoScene.world = world;
    demoScene.debugRenderer = new CannonDebugRenderer(scene, world);
    demoScene.controllers = Controllers.create(
      renderer,
      world,
      scene,
      controllerFeatures
    );
    demoScene.clock = new Clock();
    demoScene.camera = camera;

    return demoScene;
  }
}
