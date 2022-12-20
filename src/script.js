import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import modelVIewer from '@google/model-viewer'
import gsap from 'gsap'



//DOM
const modelViewer = document.querySelector("#model-viewer");
const buttonOne = document.querySelector('#button-1')


//we install gsap for the seamless animation npm i gsap

/**
 * Base
 */
// Canvas
const canvas = document.querySelector("canvas.webgl");
// Scene
const scene = new THREE.Scene();
// Loaders
const gltfLoader = new GLTFLoader();
// Popup
const popupEL = document.querySelector('.popup')

/**
 * Texture
 */
const textureLoader = new THREE.TextureLoader()
// 01
const boardTexture = textureLoader.load("/img/chuahoa03.jpeg");
boardTexture.flipY = false
// 02
const boardTexture2 = textureLoader.load("/img/2-boat.webp");
boardTexture2.flipY = false
// grass texture
const grassTexture = textureLoader.load("img/white-brick-wall-seamless.jpeg");
grassTexture.wrapS = THREE.RepeatWrapping
grassTexture.wrapT = THREE.RepeatWrapping
grassTexture.repeat.set(15,15)


//uv mapping 

/**
 * Object
 */
const cube = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshStandardMaterial({
   
   
    map:boardTexture,
   
  })
);
 //scene.add(cube);
// Ground
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(100,100), 
  new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, map:grassTexture}))
scene.add(ground)
ground.rotation.x = Math.PI/2
ground.position.y = -1
/**
 * Import Model
 */
var boards = []
gltfLoader.load("./Model/half home unwrapped.glb", (glb) => {

  glb.scene.traverse(child=>{
    if(child.type === 'Mesh'){
        child.material.side =  THREE.DoubleSide
    }
    if(
      child.name ==="Object_3001" ||
      child.name ==="Object_3003" ||
      child.name ==="Object_3004" ||
      child.name ==="Object_3005" ||
      child.name ==="Object_3006" ||
      child.name ==="Object_3007" ||
      child.name ==="Object_3008" ||
      child.name ==="Object_3009" ||
      child.name ==="Object_3010" ||
      child.name ==="Object_3011"
       ){
         child.material.color.set(new THREE.Color(0xffffff))
        child.material.map = boardTexture
       // child.rotation.x = Math.PI /2
        console.log(child);

        boards.push(child)
    }
    if(child.name ==="Object_3003"){
      child.material.color.set(new THREE.Color(0xffffff));
      child.material = new THREE.MeshBasicMaterial({map :boardTexture2})
      // child.material.map = boardTexture2;

    }
  })

  glb.scene.position.z =5 //set the object to the right side
  scene.add(glb.scene);
});
/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Model chnager
var modelchanged = false
const modelChanger = (data)=>{
  console.log("modelChanger Run");
  modelchanged = true
  if (data === "Object_3001"){
    modelViewer.setAttribute("src", "Model/iphone.glb");
  } else if(data === "Object_3003"){
    modelViewer.setAttribute("src", "Model/navigating_the_dark.glb");
  }
}


/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  40,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.x = -20;
camera.position.y = 5;
camera.position.z = 0;
scene.add(camera);

// Controls
//limit the control, orbit control
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.enableRotate = true;
controls.enableZoom = true;
controls.minPolarAngle = 0
controls.maxPolarAngle = Math.PI * 0.45

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.setClearColor(0xe5e5e5);

const pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();

// GSAP CAMERA MOVE
buttonOne.addEventListener("click", () => {
  console.log("clicked");
  gsap.to(camera.position, {x: -8,y:2, z: 0, duration: 2.5 })
})




/**
 * HDRI START
 */
const hlight = new THREE.AmbientLight(0xffffff, 1);
// scene.add(hlight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.castShadow = true;
directionalLight.shadow.camera.top = 4;
directionalLight.shadow.camera.bottom = -4;
directionalLight.shadow.camera.left = -4;
directionalLight.shadow.camera.right = 4;
directionalLight.shadow.camera.near = 0.1;
directionalLight.shadow.camera.far = 40;
directionalLight.shadow.camera.far = 40;
directionalLight.shadow.bias = -0.002;
directionalLight.position.set(0, 20, 20);  
//scene.add(directionalLight);

new RGBELoader()
  .setDataType(THREE.UnsignedByteType)
  .setPath("img/")
  .load("studio_small_08_1k.pic", function (texture) {
    const envMap = pmremGenerator.fromEquirectangular(texture).texture;

    scene.environment = envMap;

    texture.dispose();
    pmremGenerator.dispose();
  });

/**
 * HDRI END
 */
/**
 * raycaster
 */
 const raycaster = new THREE.Raycaster();
 const hoverPointer = new THREE.Vector2(-1, -1);

 canvas.addEventListener("click", function (event) {
  hoverPointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  hoverPointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  raycaster.setFromCamera(hoverPointer, camera);

  const elapsedTime = clock.getElapsedTime();

  // Update controls
  controls.update();

  // Raycaster
  if(boards.length > 0){
    const intercepts = raycaster.intersectObjects(boards)

    if(intercepts.length > 0){
      console.log(intercepts[0].object.name);

      if(!modelchanged){
        console.log("...............................");
        modelChanger(intercepts[0].object.name);
      }
        // intercepts[0].object.material = new THREE.MeshBasicMaterial({color:0xff0000})
        popupEL.style.display = "block";
    }else{
      popupEL.style.display =  'none'
      // boards.map(board=>{
        // board.material = new THREE.MeshBasicMaterial({color:0x000000})
      // })
    }
  }

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
