import { OCHand } from "../core/OCHand";
import * as CANNON from "cannon-es";
import IUpdatable from "../../common/IUpdatable";

export class HandsPhysic implements IUpdatable {
    hand: OCHand;
    world: CANNON.World;
  
    rigidBodies: CANNON.Body[];
    initialized: boolean;
  
    private constructor(hand: OCHand, world: CANNON.World) {
      this.world = world;
      this.hand = hand;
      this.rigidBodies = [];
    }
  
    update() {
      if (!this.hand.jointsLoaded) return;
  
      if (!this.initialized) {
        this.InitializePhysics();
      }
  
      this.updateRigitBodyPositions();
    }
  
    private updateRigitBodyPositions() {
      let i = 0;
      for (const key in this.hand.controllable.joints) {
        const joint = this.hand.controllable.joints[key];
        this.rigidBodies[i++].position.set(
          joint.position.x,
          joint.position.y,
          joint.position.z
        );
      }
    }
  
    private InitializePhysics() {
      for (const key in this.hand.controllable.joints) {
        const joint = this.hand.controllable.joints[key];
        const sphereShape = new CANNON.Sphere(0.01);
        const sphereBody = new CANNON.Body({ mass: 0 });
        sphereBody.addShape(sphereShape);
        this.rigidBodies.push(sphereBody);
        this.world.addBody(sphereBody);
      }
      this.initialized = true;
    }
  
    public static Create(hand: OCHand, world: CANNON.World) {
      return new HandsPhysic(hand, world);
    }
  }
  