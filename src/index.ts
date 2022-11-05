import { KeyDisplay } from "./utils";
import { CharacterControls } from "./characterControls";
import * as THREE from "three";
import { AnimationMixer, CameraHelper, Mesh, Object3D, Vector3 } from "three";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
// SCENE
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xa8def0);

// CAMERA
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.y = 7;
camera.position.z = -15;
camera.position.x = 0;

// RENDERER
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;

const orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.enableDamping = true;
orbitControls.minDistance = 5;
orbitControls.maxDistance = 15;
orbitControls.enablePan = false;
orbitControls.maxPolarAngle = Math.PI / 2 - 0.05;
orbitControls.update();

// LIGHTS
light();
// FLOOR
//generateFloor()

// MODEL WITH ANIMATIONS
var characterControls: CharacterControls;
new GLTFLoader().load("models/RunGuys.glb", function (gltf) {
  const model = gltf.scene;
  model.traverse(function (object: any) {
    if (object.isMesh) object.castShadow = true;
  });
  model.rotation.z = 0.1;
  scene.add(model);

  const gltfAnimations: THREE.AnimationClip[] = gltf.animations;
  const mixer = new THREE.AnimationMixer(model);
  const animationsMap: Map<string, THREE.AnimationAction> = new Map();
  gltfAnimations
    .filter((a) => a.name != "TPose")
    .forEach((a: THREE.AnimationClip) => {
      animationsMap.set(a.name, mixer.clipAction(a));
    });

  characterControls = new CharacterControls(
    model,
    mixer,
    animationsMap,
    orbitControls,
    camera,
    "idle"
  );
});

/* new GLTFLoader().load('models/scene.gltf', 
function (gltf) {
    const scene = gltf.scene;
    scene.add(scene);
},
    function ( xhr ) {

    console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

  },
  // called when loading has errors
  function ( error ) {

    console.log( 'An error happened' );

  }
); */

//Map
const gltfLoader = new GLTFLoader();
let mixer: THREE.AnimationMixer;

gltfLoader.load(
  "models/map.glb",
  (gltf) => {
    console.log("success");
    console.log(gltf);

    scene.add(gltf.scene);

    mixer = new THREE.AnimationMixer(gltf.scene);

    gltf.animations.forEach((clip) => {
      mixer.clipAction(clip).play();
    });
  },
  function (xhr) {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  (error) => {
    console.log("error");
    console.log(error);
  }
);

//obstacle
//let obstacleType: string[] = ['hammerCol', 'hammerRow', 'hammerThorn', 'plate', 'crown'];

const mainLoader = async () => {
  const [
    obs1,
    obs2,
    obs3,
    obs4,
    obs5, // stage 1
    obs6,
    obs7,
    obs8,
    obs9,
    obs10, // stage 2
    obs11,
    obs12,
    obs13,
    obs14,
    obs15, // stage 3
    obs16,
    obs17,
    obs18,
    obs19, // stage 4
    obs20,
    obs21, // stage 5
    crown,
    entrance,
  ] = await Promise.all([
    // 첫번째 stage 장애물
    gltfLoader.loadAsync("./models/hammer_1.glb"),
    gltfLoader.loadAsync("./models/hammer_2.glb"),
    gltfLoader.loadAsync("./models/hammer_3.glb"),
    gltfLoader.loadAsync("./models/hammer_4.glb"),
    gltfLoader.loadAsync("./models/hammer_2.glb"),

    // 두번째 stage 장애물
    gltfLoader.loadAsync("./models/hammer_4.glb"),
    gltfLoader.loadAsync("./models/hammer_2.glb"),
    gltfLoader.loadAsync("./models/hammer_2.glb"),
    gltfLoader.loadAsync("./models/hammer_2.glb"),
    gltfLoader.loadAsync("./models/hammer_1.glb"),

    // 세번째 stage 장애물
    gltfLoader.loadAsync("./models/hammer_3.glb"),
    gltfLoader.loadAsync("./models/hammer_3.glb"),
    gltfLoader.loadAsync("./models/hammer_4.glb"),
    gltfLoader.loadAsync("./models/hammer_2.glb"),
    gltfLoader.loadAsync("./models/hammer_2.glb"),

    // 네번째 stage 장애물
    gltfLoader.loadAsync("./models/hammer_1.glb"),
    gltfLoader.loadAsync("./models/hammer_4.glb"),
    gltfLoader.loadAsync("./models/hammer_4.glb"),
    gltfLoader.loadAsync("./models/hammer_2.glb"),

    // 다섯번째 stage 장애물
    gltfLoader.loadAsync("./models/hammer_3.glb"),
    gltfLoader.loadAsync("./models/hammer_3.glb"),

    // 왕관, 입장문
    gltfLoader.loadAsync("./models/crown.glb"),
    gltfLoader.loadAsync("./models/entrance.glb"),
  ]);

  // 충돌 감지 위원회
  function isCollision(collisionPoint: Object3D): void {
    let target = new THREE.Vector3();

    // 캐릭터의 중앙 좌표와 장애물의 특정 좌표가 일치하게 되면 충돌한다.
    if (
      Math.ceil(characterControls.model.position.x) ==
        Math.ceil(collisionPoint.getWorldPosition(target).x) &&
      Math.ceil(characterControls.model.position.z) ==
        Math.ceil(collisionPoint.getWorldPosition(target).z) &&
      collisionPoint.getWorldPosition(target).y < 2
    ) {
      console.log("충돌^_^");
      // 뒤로 밀려나는 에니메이션 실행
      characterControls.switchBackToggle();
    }
  }

  // 망치 type1 생성함수.
  // 수직 회전하는 작은 망치
  function makeHammerType_1(
    hammer: GLTF,
    x: number,
    y: number,
    z: number
  ): AnimationMixer {
    scene.add(hammer.scene);

    hammer.scene.position.set(x, y, z);
    hammer.scene.scale.set(4, 4, 4);

    // 망치에 적용되어있는 애니메이션을 실행시키기 위한 mixer변수
    const mixer = new THREE.AnimationMixer(hammer.scene);
    mixer.clipAction(hammer.animations[0]).play();

    return mixer;
  }

  // 망치 type2,3,4 생성 함수
  function makeHammerType_2_3_4(
    hammer: GLTF,
    hammerType: number,
    x: number,
    y: number,
    z: number
  ): void {
    scene.add(hammer.scene);
    hammer.scene.position.set(x, y, z);

    // 각 장애물마다 다른 scale 적용
    switch (hammerType) {
      //망치 type2 : 수평 회전하는 망치
      case 2:
        hammer.scene.scale.set(0.005, 0.005, 0.005);
        break;

      // 망치 type3 : 가시 달린 큰 장애물
      case 3:
        hammer.scene.scale.set(0.003, 0.003, 0.003);
        break;

      //망치 type4 : 접시같은 장애물
      case 4:
        hammer.scene.scale.set(0.005, 0.005, 0.005);
        break;

      default:
        break;
    }
  }

  // 망치 type1의 애니메이션을 실행시키키 위한 시간 변수
  const clock = new THREE.Clock();

  // 1 stage 장애물들 생성
  // makeHammerType_2_3_4(망치, 망치type, x, y, z)
  // xyz는 장애물 설치 지점
  const mixer1 = makeHammerType_1(obs1, -8, 1.5, 3);
  makeHammerType_2_3_4(obs2, 2, 4, 1, 10);
  makeHammerType_2_3_4(obs3, 3, 0, 10, 20);
  makeHammerType_2_3_4(obs4, 4, -9, 0.78, 0);
  makeHammerType_2_3_4(obs5, 2, -8, 1, 10);

  // 2 stage 장애물들 생성
  makeHammerType_2_3_4(obs6, 4, 0, 0.78, 40);
  makeHammerType_2_3_4(obs7, 2, 9, 1, 41);
  makeHammerType_2_3_4(obs8, 2, 5, 1, 50);
  makeHammerType_2_3_4(obs9, 2, -10, 1, 46);
  const mixer2 = makeHammerType_1(obs10, -25, 1.5, 36);

  // 3 stage 장애물들 생성
  makeHammerType_2_3_4(obs11, 3, -6, 10, 88);
  makeHammerType_2_3_4(obs12, 3, 5, 10, 83);
  makeHammerType_2_3_4(obs13, 4, -5, 0.78, 77);
  makeHammerType_2_3_4(obs14, 2, 5, 1, 69);
  makeHammerType_2_3_4(obs15, 2, 11, 1, 77);

  // 4 stage 장애물들 생성
  const mixer3 = makeHammerType_1(obs16, -25, 1.5, 103);
  makeHammerType_2_3_4(obs17, 4, -5, 0.78, 114);
  makeHammerType_2_3_4(obs18, 4, 3, 0.78, 105);
  makeHammerType_2_3_4(obs19, 2, 1, 1, 118);

  // 5 stage 장애물들 생성
  makeHammerType_2_3_4(obs20, 3, 5, 10, 137);
  makeHammerType_2_3_4(obs21, 3, -5, 10, 142);

  // 왕관, 입장문 생성
  scene.add(crown.scene);
  scene.add(entrance.scene);
  crown.scene.position.set(0.5, 2, 206);
  crown.scene.scale.set(1.5, 1.5, 1.5);
  entrance.scene.position.set(40, 2.5, 40);
  entrance.scene.scale.set(0.5, 0.5, 0.5);

  console.log(obs1);

  // 모든 장애물을 움직이게 하고 충돌을 감지하는 함수
  const animate = () => {
    // console.log(nice.getWorldPosition(target)); //망치 위치 확인
    // console.log(characterControls.model.position); //캐릭터 위치 확인

    requestAnimationFrame(animate);

    // 작업할 때 편하라고 주석처리 했음
    // 다른 에니메이션 & 충돌 실험해보고싶으면 여기 전체 주석 해제하면 됩니다.

    /*
      // 망치 type1 관련 함수
      let delta = clock.getDelta() * 0.5;
      mixer1.update(delta); // 첫번째 stage
      mixer2.update(delta); // 두번째 stage
      mixer3.update(delta); // 네번째 stage


      // 1 stage 장애물들 애니메이션 실행 및 충돌감지
      obs2.scene.rotation.y -= 0.05; // 수평 회전 망치 장애물
      isCollision(obs2.scene.children[0].children[0].children[0].children[9].children[0]);
      isCollision(obs2.scene.children[0].children[0].children[0].children[12].children[0]);
      obs3.scene.rotation.x += 0.03; // 가시 달린 장애물
      isCollision(obs3.scene.children[0].children[0].children[0].children[7].children[0]);
      isCollision(obs3.scene.children[0].children[0].children[0].children[5].children[0]);
      isCollision(obs3.scene.children[0].children[0].children[0].children[8].children[0]);
      obs4.scene.rotation.y += 0.06; // 접시 모양 장애물
      isCollision(obs4.scene.children[0].children[0].children[0].children[13].children[0]);
      isCollision(obs4.scene.children[0].children[0].children[0].children[14].children[0]);
      obs5.scene.rotation.y += 0.05; // 수평 회전 망치 장애물
      isCollision(obs5.scene.children[0].children[0].children[0].children[9].children[0]);
      isCollision(obs5.scene.children[0].children[0].children[0].children[12].children[0]);

      // 2 stage 장애물들 애니메이션 실행 및 충돌감지
      obs6.scene.rotation.y += 0.1; // 접시 모양 장애물
      isCollision(obs6.scene.children[0].children[0].children[0].children[13].children[0]);
      isCollision(obs6.scene.children[0].children[0].children[0].children[14].children[0]);
      obs7.scene.rotation.y += 0.08; // 수평 회전 망치 장애물
      isCollision(obs7.scene.children[0].children[0].children[0].children[9].children[0]);
      isCollision(obs7.scene.children[0].children[0].children[0].children[12].children[0]);
      obs8.scene.rotation.y -= 0.09; // 수평 회전 망치 장애물
      isCollision(obs8.scene.children[0].children[0].children[0].children[9].children[0]);
      isCollision(obs8.scene.children[0].children[0].children[0].children[12].children[0]);
      obs9.scene.rotation.y += 0.1; // 수평 회전 망치 장애물
      isCollision(obs9.scene.children[0].children[0].children[0].children[9].children[0]);
      isCollision(obs9.scene.children[0].children[0].children[0].children[12].children[0]);

      // 3 stage 장애물들 애니메이션 실행 및 충돌감지
      obs11.scene.rotation.x += 0.07; // 가시 달린 장애물
      isCollision(obs11.scene.children[0].children[0].children[0].children[7].children[0]);
      isCollision(obs11.scene.children[0].children[0].children[0].children[5].children[0]);
      isCollision(obs11.scene.children[0].children[0].children[0].children[8].children[0]);
      obs12.scene.rotation.x -= 0.06; // 가시 달린 장애물
      isCollision(obs12.scene.children[0].children[0].children[0].children[7].children[0]);
      isCollision(obs12.scene.children[0].children[0].children[0].children[5].children[0]);
      isCollision(obs12.scene.children[0].children[0].children[0].children[8].children[0]);
      obs13.scene.rotation.y += 0.18; // 접시 모양 장애물
      isCollision(obs13.scene.children[0].children[0].children[0].children[13].children[0]);
      isCollision(obs13.scene.children[0].children[0].children[0].children[14].children[0]);
      obs14.scene.rotation.y -= 0.07; // 수평 회전 망치 장애물
      isCollision(obs14.scene.children[0].children[0].children[0].children[9].children[0]);
      isCollision(obs14.scene.children[0].children[0].children[0].children[12].children[0]);
      obs15.scene.rotation.y -= 0.08; // 수평 회전 망치 장애물
      isCollision(obs15.scene.children[0].children[0].children[0].children[9].children[0]);
      isCollision(obs15.scene.children[0].children[0].children[0].children[12].children[0]);
      
      // 4 stage 장애물들 애니메이션 실행 및 충돌감지
      obs17.scene.rotation.y += 0.13; // 접시 모양 장애물
      isCollision(obs17.scene.children[0].children[0].children[0].children[13].children[0]);
      isCollision(obs17.scene.children[0].children[0].children[0].children[14].children[0]);
      obs18.scene.rotation.y += 0.15; // 접시 모양 장애물
      isCollision(obs18.scene.children[0].children[0].children[0].children[13].children[0]);
      isCollision(obs18.scene.children[0].children[0].children[0].children[14].children[0]);
      obs19.scene.rotation.y -= 0.08; // 수평 회전 망치 장애물
      isCollision(obs19.scene.children[0].children[0].children[0].children[9].children[0]);
      isCollision(obs19.scene.children[0].children[0].children[0].children[12].children[0]);

      // 5 stage 장애물들 애니메이션 실행 및 충돌감지
      obs20.scene.rotation.x += 0.06; // 가시 달린 장애물
      isCollision(obs20.scene.children[0].children[0].children[0].children[7].children[0]);
      isCollision(obs20.scene.children[0].children[0].children[0].children[5].children[0]);
      isCollision(obs20.scene.children[0].children[0].children[0].children[8].children[0]);
      obs21.scene.rotation.x += 0.04; // 가시 달린 장애물
      isCollision(obs21.scene.children[0].children[0].children[0].children[7].children[0]);
      isCollision(obs21.scene.children[0].children[0].children[0].children[5].children[0]);
      isCollision(obs21.scene.children[0].children[0].children[0].children[8].children[0]);

      
*/

    renderer.render(scene, camera);
  };
  animate();
};
mainLoader();

// CONTROL KEYS
const keysPressed = {};
const keyDisplayQueue = new KeyDisplay();
document.addEventListener(
  "keydown",
  (event) => {
    characterControls.startFlag = true;
    console.log(event.key);
    keyDisplayQueue.down(event.key);
    if (event.shiftKey && characterControls) {
      characterControls.switchRunToggle();
    } else {
      if (event.key == " ") {
        // space
        characterControls.switchJumpToggle();
      } else if (event.key == "n") {
        // space
        characterControls.switchBackToggle();
      } else if (event.key == "q") {
        // space
        characterControls.switchFinishToggle();
      }
      (keysPressed as any)[event.key.toLowerCase()] = true;
    }
  },
  false
);
document.addEventListener(
  "keyup",
  (event) => {
    keyDisplayQueue.up(event.key);
    (keysPressed as any)[event.key.toLowerCase()] = false;
  },
  false
);

const clock = new THREE.Clock();
//let delta = clock.getDelta();
// ANIMATE
function animate() {
  let delta = clock.getDelta() * 1.4;
  if (characterControls) {
    characterControls.update(delta, keysPressed);
  }
  orbitControls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
document.body.appendChild(renderer.domElement);
animate();

function animateMap() {
  let delta = clock.getDelta() * 2;
  if (mixer) mixer.update(delta);

  renderer.render(scene, camera);

  requestAnimationFrame(animateMap);
}
animateMap();

// RESIZE HANDLER
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  keyDisplayQueue.updatePosition();
}
window.addEventListener("resize", onWindowResize);

function generateFloor() {
  // TEXTURES
  const textureLoader = new THREE.TextureLoader();
  const placeholder = textureLoader.load(
    "./textures/placeholder/placeholder.png"
  );
  const sandBaseColor = textureLoader.load(
    "./textures/sand/Sand 002_COLOR.jpg"
  );
  const sandNormalMap = textureLoader.load("./textures/sand/Sand 002_NRM.jpg");
  const sandHeightMap = textureLoader.load("./textures/sand/Sand 002_DISP.jpg");
  const sandAmbientOcclusion = textureLoader.load(
    "./textures/sand/Sand 002_OCC.jpg"
  );

  const WIDTH = 80;
  const LENGTH = 80;

  const geometry = new THREE.PlaneGeometry(WIDTH, LENGTH, 512, 512);
  const material = new THREE.MeshStandardMaterial({
    map: sandBaseColor,
    normalMap: sandNormalMap,
    displacementMap: sandHeightMap,
    displacementScale: 0.1,
    aoMap: sandAmbientOcclusion,
  });
  wrapAndRepeatTexture(material.map);
  wrapAndRepeatTexture(material.normalMap);
  wrapAndRepeatTexture(material.displacementMap);
  wrapAndRepeatTexture(material.aoMap);
  // const material = new THREE.MeshPhongMaterial({ map: placeholder})

  const floor = new THREE.Mesh(geometry, material);
  floor.receiveShadow = true;
  //floor.position.y = -0.1
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);
}

function wrapAndRepeatTexture(map: THREE.Texture) {
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.repeat.x = map.repeat.y = 10;
}

function light() {
  scene.add(new THREE.AmbientLight(0xffffff, 0.7));
  const dirLight = new THREE.DirectionalLight(0xffffff, 1);

  const plight = new THREE.PointLight(0xffffff, 1.5);
  plight.position.set(0, 3, 5);
  scene.add(plight);

  const plight1 = new THREE.PointLight(0xffffff, 2);
  plight1.position.set(0, -3, -10);
  scene.add(plight1);

  const plight2 = new THREE.PointLight(0xffffff, 2);
  plight1.position.set(0, 7, -20);
  scene.add(plight2);

  dirLight.position.set(0, 100, 100);
  // dirLight.castShadow = true;
  // dirLight.shadow.camera.top = 30;
  // dirLight.shadow.camera.bottom = 0;
  // dirLight.shadow.camera.left = -30;
  // dirLight.shadow.camera.right = 50;
  // dirLight.shadow.camera.near = 0.1;
  // dirLight.shadow.camera.far = 100;
  // dirLight.shadow.mapSize.width = 4096;
  // dirLight.shadow.mapSize.height = 4096;

  scene.add(dirLight);

  sky();
  // scene.add( new THREE.CameraHelper(dirLight.shadow.camera))
}

function sky() {
  const geometry2 = new THREE.SphereGeometry(500, 32, 16);
  const texture2 = new THREE.TextureLoader().load("./textures/sky/sky.webp"); //loads the picture on the spherical geometry

  const material2 = new THREE.MeshBasicMaterial({
    map: texture2,
    side: THREE.BackSide,
  }); //pastes the picture on the spherical geometry.

  const sphere2 = new THREE.Mesh(geometry2, material2); //creates sphere from spherical geometry and texture
  scene.add(sphere2);
}
