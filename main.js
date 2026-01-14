import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

// CANVAS
const canvas = document.getElementById("myCanvas");

// SCENE
const scene = new THREE.Scene();

// size
const s = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// camera

const camera = new THREE.PerspectiveCamera(75, s.width / s.height, 0.4, 1000);

camera.position.set(0, 0, 5);

camera.lookAt(0, 0, 0);
scene.add(camera);

// RENDER

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.setSize(s.width, s.height);
renderer.render(scene, camera);

// CONTROLS
const controls = new OrbitControls(camera, renderer.domElement);

controls.keys = {
  LEFT: "ArrowLeft", //left arrow
  UP: "ArrowUp", // up arrow
  RIGHT: "ArrowRight", // right arrow
  BOTTOM: "ArrowDown", // down arrow
};

controls.enableDamping = true;
controls.dampingFactor = 0.3;
controls.enableZoom = true;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.5;
controls.enablePan = true;
controls.keyPanSpeed = 7.0;

// LOAD MODEL
const loader = new GLTFLoader();
let model3D;
loader.load(
  "./models/car.glb",
  (gltf) => {
    model3D = gltf.scene;
    model3D.position.set(0, 0, 0);
    model3D.scale.set(0.2, 0.2, 0.2);
    scene.add(model3D);
  },
  (xhr) => {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  (error) => {
    console.error("An error has occurred", error);
  }
);
// axes helper
const axeshelper = new THREE.AxesHelper();
scene.add(axeshelper);

// Key
const keys = () => {
  document.addEventListener("keydown", (e) => {
    if (!model3D) return;

    // keys conditions
    switch (e.key.toLowerCase() || e.key.toUpperCase()) {
      case "w":
        model3D.position.z += 0.1;
        break;
      case "s":
        model3D.position.z -= 0.1;
        break;
      case "a":
        model3D.position.x += 0.1;
        break;
      case "d":
        model3D.position.x -= 0.1;
        break;
      case "q":
        model3D.rotation.y += 0.1;
        break;
      case "e":
        model3D.rotation.y -= 0.1;
        break;
      case "z":
        model3D.position.y -= 0.1;
        break;
      case "x":
        model3D.position.y += 0.1;
        break;
      default:
        console.warn(alert("Unknown key pressed"));
    }
  });
};
keys();

// RESIZE
window.addEventListener("resize", () => {
  // Update camera aspect ratio
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  // Update renderer size
  renderer.setSize(window.innerWidth, window.innerHeight);
});

//  FullScreen
const doubleClick = () => {
  if (!document.fullscreenElement) {
    canvas.requestFullscreen().catch((err) => {
      console.error("Error attempting to enable full-screen mode:", err);
    });
  } else {
    document.exitFullscreen();
  }
};

canvas.addEventListener("dblclick", doubleClick);

// ANIMATE

const animate = () => {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
};

animate();
