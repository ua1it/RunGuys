import { KeyDisplay } from "./utils";
import { CharacterControls } from "./characterControls";
import * as THREE from "three";
import { CameraHelper } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
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
new GLTFLoader().load("models/FallGuys3.glb", function (gltf) {
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
  "models/untitled.glb",
  (gltf) => {
    console.log("success");
    console.log(gltf);

    scene.add(gltf.scene);

    mixer = new THREE.AnimationMixer(gltf.scene);

    gltf.animations.forEach((clip) => {
      mixer.clipAction(clip).play();
    });

    let Cube = gltf.scene.children[5];
    let Cube002 = gltf.scene.children[6];
    let Cube003 = gltf.scene.children[7];

    console.log("Position");
    console.log(Cube.getWorldPosition(Cube.position));
    //Vector3 {x: 22.379180908203125, y: 0.33713316917419434, z: 11.690906524658203}
    console.log(Cube002.getWorldPosition(Cube002.position));
    //Vector3 {x: -22.561954498291016, y: -0.2211005687713623, z: 11.767125129699707}
    console.log(Cube003.getWorldPosition(Cube003.position));
    //Vector3 {x: 0.8326816558837891, y: -2.900982618331909, z: -7.809866428375244}
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
    const [hammer_1, hammer_2, hammer_3, obstacle, crown, entrance, hammer_4] = await Promise.all([
      gltfLoader.loadAsync('./models/hammer_1.glb'),
      gltfLoader.loadAsync('./models/hammer_2.glb'),
      gltfLoader.loadAsync('./models/hammer_3.glb'),
      gltfLoader.loadAsync('./models/obstacle.glb'),
      gltfLoader.loadAsync('./models/crown.glb'),
      gltfLoader.loadAsync('./models/entrance.glb'),
      gltfLoader.loadAsync('./models/hammer_2.glb'),
    ]);
    
    scene.add(hammer_1.scene); 
    console.log(typeof hammer_1);
    
    let clock = new THREE.Clock();
    const mixer = new THREE.AnimationMixer(hammer_1.scene);
    mixer.clipAction(hammer_1.animations[0]).play();

    scene.add(hammer_2.scene);
    let nice = hammer_2.scene.children[0].children[0].children[0].children[9].children[0];
    
    scene.add(hammer_3.scene);
    scene.add(obstacle.scene);
    scene.add(crown.scene);
    scene.add(entrance.scene);
    scene.add(hammer_4.scene);
    
    hammer_1.scene.position.set(0, 1.5, 0);
    hammer_1.scene.scale.set(4, 4, 4);   
    
    hammer_2.scene.position.set(10, 1, 10);
    hammer_2.scene.scale.set(0.005, 0.005, 0.005);

    hammer_3.scene.position.set(0, 10, 20);
    hammer_3.scene.scale.set(0.003, 0.003, 0.003);        

    obstacle.scene.position.set(-10, 0.78, 0);
    obstacle.scene.scale.set(0.005, 0.005, 0.005);

    crown.scene.position.set(0.5, 2, 206);
    crown.scene.scale.set(1.5, 1.5, 1.5);

    entrance.scene.position.set(40, 2.5, 40);
    entrance.scene.scale.set(0.5, 0.5, 0.5);

    hammer_4.scene.position.set(-10, 1, 10);
    hammer_4.scene.scale.set(0.005, 0.005, 0.005);
    
    const animate = () => {
      requestAnimationFrame(animate);

      let delta = clock.getDelta()*0.5;
      mixer.update(delta);

      hammer_2.scene.rotation.y -= 0.05;
      let target = new THREE.Vector3();
      // console.log(nice.getWorldPosition(target)); //망치
      //console.log(characterControls.model.position); //캐릭터


      if (Math.ceil(characterControls.model.position.x) == Math.ceil(nice.getWorldPosition(target).x)
        && Math.ceil(characterControls.model.position.z) == Math.ceil(nice.getWorldPosition(target).z)) {
        console.log('충돌^_^');
        characterControls.switchBackToggle();
      }
        
      hammer_3.scene.rotation.x += 0.01;
      obstacle.scene.rotation.y += 0.01;
      hammer_4.scene.rotation.y -= 0.05;

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
      }
      else if (event.key == "q") {
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
