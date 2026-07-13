/**
 * File Name: main.js
 * Description: The main execution entry point for the 3D Car Viewer application.
 *              Bootstraps the scene, camera, renderer, lighting, ground, controls,
 *              loading routines, and key event listeners, and executes the render loop.
 */

import * as THREE from "three";
import { createScene } from "./src/core/Scene.js";
import { createCamera, CinematicCameraManager, CINEMATIC_PATHS } from "./src/core/Camera.js";
import { createRenderer, updateRendererSize } from "./src/core/Renderer.js";
import { createControls } from "./src/core/Controls.js";
import { setupLighting, animateAccentLight } from "./src/lights/Lighting.js";
import { createGround } from "./src/objects/Ground.js";
import { loadCarModel } from "./src/objects/CarModel.js";
import {
  createCinematicUI,
  updateCameraIndicator,
  setCinematicUIState,
  hideLoadingOverlay,
  updateLoadingProgress,
} from "./src/ui/CinematicUI.js";

// ─── INITIALIZATION ──────────────────────────────────────────────────

// Reference to HTML5 Canvas element
const canvas = document.getElementById("myCanvas");

// Viewport sizes configuration object
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// Create the core ThreeJS modules
const scene = createScene(0x0a0a0f, 0x0a0a0f, 0.15);
const camera = createCamera(sizes.width, sizes.height);
const renderer = createRenderer(canvas, sizes.width, sizes.height);
const controls = createControls(camera, renderer.domElement);

// Setup scene elements (Lights, Floor Ground)
const lights = setupLighting(scene);
const ground = createGround(scene);

// Ensure the camera is registered within the scene graph
scene.add(camera);

// ─── CINEMATIC UI SETUP ──────────────────────────────────────────────
createCinematicUI(CINEMATIC_PATHS.length);

// ─── CAMERA SYSTEM CONFIGURATION ──────────────────────────────────────
const cameraManager = new CinematicCameraManager(camera, (index) => {
  // Callback: whenever the active path changes, update indicators and labels in the UI
  updateCameraIndicator(index, CINEMATIC_PATHS[index].name);
});

// ─── 3D MODEL LOADING ────────────────────────────────────────────────
let model3D;
let modelCenter = new THREE.Vector3(0, 0, 0);
let modelRadius = 2;

loadCarModel(
  scene,
  "./models/car.glb",
  // onLoad callback
  (model, center, radius) => {
    model3D = model;
    modelCenter.copy(center);
    modelRadius = radius;

    // Smoothly slide down preloader and initiate camera entrance sweep
    hideLoadingOverlay(() => {
      cameraManager.startEntranceTransition();
    });
  },
  // onProgress callback
  (percent) => {
    updateLoadingProgress(percent);
  },
  // onError callback
  (error) => {
    console.error("An error occurred while loading the car mesh asset:", error);
  }
);

// ─── CLOCK & RUNTIME COUNTER ─────────────────────────────────────────
const clock = new THREE.Clock();
let elapsed = 0;

// ─── EVENT LISTENERS ─────────────────────────────────────────────────

/**
 * Resize Listener
 * Description: Keeps camera aspect ratios and renderer viewport dimensions sync'd on screen resize events.
 */
window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Recalculate camera aspect ratio and project projection matrix updates
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Resize WebGL viewport framebuffers
  updateRendererSize(renderer, sizes.width, sizes.height);
});

/**
 * Fullscreen Double Click Listener
 * Description: Standard double-click callback on canvas toggling browser full-screen viewport.
 */
canvas.addEventListener("dblclick", () => {
  if (!document.fullscreenElement) {
    canvas.requestFullscreen().catch((err) => {
      console.error("Error attempting to enable full-screen mode:", err);
    });
  } else {
    document.exitFullscreen();
  }
});

/**
 * Keyboard Control Listener
 * Description: Monitors keystrokes:
 *   - '1', '2', '3', '4' keys transition to specific cinematic cameras.
 *   - Spacebar toggles between Cinematic Mode (automated tracks) and Free Camera Mode (manual OrbitControls).
 */
document.addEventListener("keydown", (e) => {
  const key = e.key.toLowerCase();

  // Key select transition targets
  if (key === "1" || key === "2" || key === "3" || key === "4") {
    const idx = parseInt(key) - 1;
    if (idx >= CINEMATIC_PATHS.length) return;

    // Force return to cinematic mode if user was in free controls mode
    if (!cameraManager.cinematicMode) {
      cameraManager.cinematicMode = true;
      controls.enabled = false;
      setCinematicUIState(true);
    }

    // Blend current coordinates seamlessly to chosen path from the manual controls focus
    cameraManager.startTransitionToPath(idx, controls.target);
    return;
  }

  // Spacebar controls modes toggle
  if (key === " ") {
    e.preventDefault();

    // Toggle logic
    cameraManager.cinematicMode = !cameraManager.cinematicMode;
    controls.enabled = !cameraManager.cinematicMode;

    // Propagate UI layout changes (bars height modifications)
    setCinematicUIState(cameraManager.cinematicMode);

    // If returning to cinematic, initiate blend transition from current manual coordinates and focus
    if (cameraManager.cinematicMode) {
      cameraManager.startTransitionToPath(cameraManager.currentPathIndex, controls.target);
    }
  }
});

// ─── MAIN ANIMATION LOOP ─────────────────────────────────────────────

/**
 * Function Name: animate
 * Description: The primary application loop executing each render frame. Updates light animations,
 *              calculates active camera movements/orbit adjustments, and renders the scene buffer.
 */
const animate = () => {
  requestAnimationFrame(animate);

  // Capture total clock runtime
  elapsed = clock.getElapsedTime();

  // Animate floor-spotlight colors HSL properties
  animateAccentLight(lights.accentLight, elapsed);

  // Process camera view coordinate adjustments
  if (cameraManager.cinematicMode) {
    cameraManager.update(elapsed);
  } else {
    // Required updates for OrbitControls inertia damping
    controls.update();
  }

  // Draw updated scene frame
  renderer.render(scene, camera);
};

// Start animation loop sequence
animate();
