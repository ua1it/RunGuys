import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { A, D, DIRECTIONS, S, W, SPACE } from "./utils";

export class CharacterControls {
  model: THREE.Group;
  mixer: THREE.AnimationMixer;
  animationsMap: Map<string, THREE.AnimationAction> = new Map(); // walking, Run, Idle
  orbitControl: OrbitControls;
  camera: THREE.Camera;

  // state
  toggleRun: boolean = true;
  toggleJump: boolean = false;
  currentAction: string;

  // temporary data
  walkDirection = new THREE.Vector3();
  rotateAngle = new THREE.Vector3(0, 1, 0);
  rotateQuarternion: THREE.Quaternion = new THREE.Quaternion();
  cameraTarget = new THREE.Vector3();

  // constants
  fadeDuration: number = 0.2;
  runVelocity = 10;
  walkVelocity = 3;

  constructor(
    model: THREE.Group,
    mixer: THREE.AnimationMixer,
    animationsMap: Map<string, THREE.AnimationAction>,
    orbitControl: OrbitControls,
    camera: THREE.Camera,
    currentAction: string
  ) {
    this.model = model;
    this.mixer = mixer;
    this.animationsMap = animationsMap;
    this.currentAction = currentAction;
    this.animationsMap.forEach((value, key) => {
      if (key == currentAction) {
        value.play();
      }
    });
    this.orbitControl = orbitControl;
    this.camera = camera;
    this.updateCameraTarget(0, 0, 0, "none");
  }

  public switchRunToggle() {
    this.toggleRun = !this.toggleRun;
  }

  public switchJumpToggle() {
    this.toggleJump = true;
    const timeout = setTimeout(() => {
      this.toggleJump = false;
    }, 1000);
  }


  public update(delta: number, keysPressed: any) {
    const directionPressed = DIRECTIONS.some((key) => keysPressed[key] == true);

    // available animation
    // falling
    // backward
    // idle
    // running
    // walking
    // jump
    var play = "";
    if (directionPressed && this.toggleRun && !this.toggleJump) {
      play = "running";
    } else if (directionPressed && !this.toggleJump) {
      play = "walking";
    } else {
      if (this.toggleJump) {
        play = "jump";
      } else {
        play = "idle";
      }
    }

    if (this.currentAction != play) {
      const toPlay = this.animationsMap.get(play);
      const current = this.animationsMap.get(this.currentAction);

      current.fadeOut(this.fadeDuration);
      toPlay.reset().fadeIn(this.fadeDuration).play();

      this.currentAction = play;
    }

    this.mixer.update(delta * 1.4);

    if (this.currentAction == "running" || this.currentAction == "walking") {
      // calculate towards camera direction
      var angleYCameraDirection = Math.atan2(
        this.camera.position.x - this.model.position.x,
        this.camera.position.z - this.model.position.z
      );
      // diagonal movement angle offset
      var directionOffset = this.directionOffset(keysPressed);

      // rotate model
      this.rotateQuarternion.setFromAxisAngle(
        this.rotateAngle,
        directionOffset
      );
      this.model.quaternion.rotateTowards(this.rotateQuarternion, 0.2);

      // calculate direction
      this.camera.getWorldDirection(this.walkDirection);
      this.walkDirection.y = 0;
      this.walkDirection.normalize();
      this.walkDirection.applyAxisAngle(this.rotateAngle, directionOffset);

      // run/walk velocity
      const velocity = this.runVelocity;

      // move model & camera
      const moveX = this.walkDirection.x * velocity * delta;
      const moveZ = this.walkDirection.z * velocity * delta;
      this.model.position.x += moveX;
      this.model.position.z += moveZ;
      this.updateCameraTarget(moveX, moveZ, 0, this.currentAction);
    }

    if (this.currentAction == "jump") {
      this.mixer.update(delta * 1.4);
      // diagonal movement angle offset
      var directionOffset = this.directionOffset(keysPressed);

      // calculate direction
      this.camera.getWorldDirection(this.walkDirection);
      this.walkDirection.normalize();
      this.walkDirection.applyAxisAngle(this.rotateAngle, directionOffset);

      const velocity = this.runVelocity;

      // move model & camera
      const moveX = this.walkDirection.x * velocity * delta;
      const moveZ = this.walkDirection.z * velocity * delta;
      const moveY = this.walkDirection.y * velocity * delta;
      this.model.position.x += moveX;
      this.model.position.z += moveZ;
      this.model.position.y -= moveY;
      this.goingDown(moveX,moveY,moveZ);
      this.updateCameraTarget(moveX, moveZ, moveY, this.currentAction);
    }
  }
  public goingDown(moveX: number, moveY: number, moveZ: number){
    const timeout = setTimeout(()=>{
      this.model.position.x += moveX*0.5;
      this.model.position.z += moveZ*0.5;
      this.model.position.y += moveY;
    },500);
  }

  private updateCameraTarget(moveX: number, moveZ: number, moveY: number, Action: String) {
    // // move camera
    // this.camera.position.x += moveX
    // this.camera.position.z += moveZ
    // this.camera.position.y += moveY

    if(Action == "running" || Action == "walking"){
      // move camera
      this.camera.position.x = this.camera.position.x + moveX;
      this.camera.position.z = this.camera.position.z + moveZ;

      // update camera target
      this.cameraTarget.x = this.model.position.x;
      this.cameraTarget.z = this.model.position.z;
      this.orbitControl.target = this.cameraTarget;
    }else if(Action == "jump"){
      // move camera
      this.camera.position.x = this.camera.position.x + moveX;
      this.camera.position.z = this.camera.position.z + moveZ;

      // update camera target
      this.cameraTarget.x = this.model.position.x;
      this.cameraTarget.z = this.model.position.z;
      this.orbitControl.target = this.cameraTarget;
    }

  }

  private directionOffset(keysPressed: any) {
    var directionOffset = 0; // w

    if (keysPressed[W]) {
      if (keysPressed[A]) {
        directionOffset = Math.PI / 4; // w+a
      } else if (keysPressed[D]) {
        directionOffset = -Math.PI / 4; // w+d
      }
    } else if (keysPressed[S]) {
      if (keysPressed[A]) {
        directionOffset = Math.PI / 4 + Math.PI / 2; // s+a
      } else if (keysPressed[D]) {
        directionOffset = -Math.PI / 4 - Math.PI / 2; // s+d
      } else {
        directionOffset = Math.PI; // s
      }
    } else if (keysPressed[A]) {
      directionOffset = Math.PI / 2; // a
    } else if (keysPressed[D]) {
      directionOffset = -Math.PI / 2; // d
    }

    return directionOffset;
  }
}
