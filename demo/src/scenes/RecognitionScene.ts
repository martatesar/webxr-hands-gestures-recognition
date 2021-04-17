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
  textMesh: Mesh;
  textMesh2: Mesh;
  font: Font;

  initialize(parentElement: HTMLElement) {
    super.initialize(parentElement);

    let controls = new OrbitControls(this.camera, parentElement);
    controls.target.set(0, 1.6, 0);
    controls.update();

    this.controllers.hands.left?.controllable.addEventListener(
      "gesture_changed",
      (evt) => this.setText(evt.gesture || " ", 0)
    );
    this.controllers.hands.right?.controllable.addEventListener(
      "gesture_changed",
      (evt) => this.setText(evt.gesture || " ", 1)
    );
    this.setText("Hands VR", 1);
  }

  update(): void {
    let delta = this.clock.getDelta();
    if (delta > 0.1) delta = 0.1;
    this.world.step(delta);

    this.controllers.update();
    this.debugRenderer.update();
    this.renderer.render(this.scene, this.camera);
  }

  setText(text: string, id: number): void {
    if (id == 0) if (this.textMesh != null) this.scene.remove(this.textMesh);
    if (id == 1) if (this.textMesh2 != null) this.scene.remove(this.textMesh2);

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

    let textMesh = new Mesh(textGeo, fontMaterials);

    textMesh.position.x = centerOffset - ((id == 0) ? 0.5 : -0.5);
    textMesh.position.y = 1;
    textMesh.position.z = -2;

    textMesh.rotation.x = 0;
    textMesh.rotation.y = Math.PI * 2;

    textMesh.lookAt(this.camera.position);

    if (id == 0) {
      this.textMesh = textMesh;
      this.scene.add(this.textMesh);
    }else{
      this.textMesh2 = textMesh;
      this.scene.add(this.textMesh2);
    }
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
