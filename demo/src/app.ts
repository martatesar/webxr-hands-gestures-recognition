import { VRButton } from "three/examples/jsm/webxr/VRButton";
import { EControllerFeatures } from "./controllers/Controllers";
import { RecognitionScene } from "./scenes/RecognitionScene";

let container = document.createElement("div");
document.body.appendChild(container);

// right and left recognition
let demoScene = RecognitionScene.create(
  EControllerFeatures.RecognitionRight | EControllerFeatures.RecognitionLeft
  // |EControllerFeatures.PhysicLeft
  //EControllerFeatures.PhysicRight
);

// enable physics
// let demoScene = RecognitionScene.create(
//   EControllerFeatures.RecognitionRight |
//     EControllerFeatures.RecognitionLeft |
//     EControllerFeatures.PhysicLeft |
//     EControllerFeatures.PhysicRight
// );

// learn left hand, confirm gesture with pinch gesture on other (right) hand, then copy json of gesture from console 
// let demoScene = RecognitionScene.create(EControllerFeatures.LearnRecognitionLeft);

document.body.appendChild(VRButton.createButton(demoScene.renderer));
demoScene.initialize(container);
