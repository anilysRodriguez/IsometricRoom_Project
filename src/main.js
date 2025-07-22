import  "./style.scss";
import * as THREE from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const canvas = document.querySelector('#experience-canvas');
const size = {
    width: window.innerWidth,
    height: window.innerHeight
};

//Loaders
const textureLoader = new THREE.TextureLoader();

//model loader
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("/draco/");

const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);

const environmentMap = new THREE.CubeTextureLoader()
  .setPath("textures/skybox/")
  .load(["px.webp", "nx.webp", "py.webp", "ny.webp", "pz.webp", "nz.webp"]);

const textureMap = {
  First: {
    day: "/textures/room/day/first_texture_set_day.webp",
    night: "/textures/room/night/first_texture_set_night.webp",
  },
  Second: {
    day: "/textures/room/day/second_texture_set_day.webp",
    night: "/textures/room/night/second_texture_set_night.webp",
  },
  Third: {
    day: "/textures/room/day/third_texture_set_day.webp",
    night: "/textures/room/night/third_texture_set_night.webp",
  },
  Fourth: {
    day: "/textures/room/day/fourth_texture_set_day.webp",
    night: "/textures/room/night/fourth_texture_set_night.webp",
  },
};

const loadedTextures = {
  day: {},
  night: {},
};

Object.entries(textureMap).forEach(([key, paths]) => {
 const dayTexture = textureLoader.load(paths.day);
 loadedTextures.day[key] = dayTexture;
 dayTexture.flipY = false;
 dayTexture.colorSpace = THREE.SRGBColorSpace;
 dayTexture.minFilter = THREE.LinearFilter;
 dayTexture.magFilter = THREE.LinearFilter;
 loadedTextures.day[key] = dayTexture;

 const nightTexture = textureLoader.load(paths.night);
 loadedTextures.night[key] = nightTexture;
 nightTexture.flipY = false;
 nightTexture.colorSpace = THREE.SRGBColorSpace;
 nightTexture.minFilter = THREE.LinearFilter;
 nightTexture.magFilter = THREE.LinearFilter;
 loadedTextures.night[key] = nightTexture;
});    

// Reuseable Materials
const glassMaterial = new THREE.MeshPhysicalMaterial({
  transmission: 1,
  opacity: 1,
  color: 0xfbfbfb,
  metalness: 0,
  roughness: 0,
  ior: 3,
  thickness: 0.01,
  specularIntensity: 1,
  envMap: environmentMap,
  envMapIntensity: 1,
  depthWrite: false,
  specularColor: 0xfbfbfb,
});

const whiteMaterial = new THREE.MeshBasicMaterial({
  color: 0xffffff,
});

const videoElement = document.createElement("video");
videoElement.src = "/textures/video/pixelroom.mp4";
videoElement.loop = true;
videoElement.muted = true;
videoElement.playsInline = true;
videoElement.autoplay = true;
videoElement.play();

const videoTexture = new THREE.VideoTexture(videoElement);
videoTexture.colorSpace = THREE.SRGBColorSpace;
videoTexture.flipY = false;

loader.load("/models/IsometricRoom_MGomez_ARodriguez_Final-v1.glb", (glb) => {
    glb.scene.traverse((child) => {
        if (child.isMesh) {
            if (child.name.includes("Water")) {
                child.material = new THREE.MeshBasicMaterial({
                    color: 0x558bc8,
                    transparent: true,
                    opacity: 0.4,
                    depthWrite: false,
                });
            }else if(child.name.includes("Glass")){
                child.material = glassMaterial;
            }else if(child.name.includes("Bubble")){
                child.material = whiteMaterial;
            }else if(child.name.includes("Screen")){
                child.material = new THREE.MeshBasicMaterial({
                    map: videoTexture,
                    transparent: true,
                    opacity: 0.9,
                });
            }else {
                Object.keys(textureMap).forEach((key) => {
                    if(child.name.includes(key)) {
                        const material = new THREE.MeshBasicMaterial({
                            map: loadedTextures.day[key],
                        });
                        child.material = material;

                        if(child.material.map){
                            child.material.map.minFilter = THREE.LinearFilter;
                        }
                    }
                });
            }
        }
    });
    scene.add(glb.scene);
});


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    35, 
    size.width / size.height, 
    0.1, 
    1000
);
camera.position.set( 
17.49173098423395, 9.108969527553887, 17.850992894238058
);
camera.position.z = 5;
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(size.width, size.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.update();
controls.target.set(
-1.1210097686725013,
2.581274700734551,
0.6133837834313352
);
//Event listener for resizing the window
window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

   // Update Camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}); 

const render = () => {
    controls.update();
    // console.log(camera.position);
    // console.log("000000000");
    // console.log(controls.target);
    renderer.render(scene, camera);

    window.requestAnimationFrame(render);
};

render();