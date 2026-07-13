/**
 * Module Name: Controls
 * Description: Initializes the OrbitControls for free camera mode, applying damping and limits.
 */

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

/**
 * Function Name: createControls
 * Description: Creates an instance of OrbitControls, sets damping factors, zoom bounds, 
 *              polar angle locks, and starts in disabled state.
 * 
 * Inputs:
 *   - camera: THREE.Camera (The camera instance to control)
 *   - domElement: HTMLElement (The renderer's canvas element, e.g., renderer.domElement)
 * 
 * Outputs / Returns:
 *   - OrbitControls (The configured OrbitControls instance)
 * 
 * Example:
 *   import { createControls } from "./src/core/Controls.js";
 *   const controls = createControls(camera, renderer.domElement);
 */
export function createControls(camera, domElement) {
  const controls = new OrbitControls(camera, domElement);

  // Enable physically-based inertia damping for smooth manual movements
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  // Configuration settings for manual camera interactions
  controls.enableZoom = true;
  controls.autoRotate = false;
  controls.enablePan = true;

  // Lock target so camera cannot plunge below the ground plane (y < 0)
  controls.maxPolarAngle = Math.PI / 2;

  // Restrict zoom limits to prevent clipping inside or straying too far
  controls.minDistance = 2;
  controls.maxDistance = 15;

  // Start controls as disabled since Cinematic Mode starts as active
  controls.enabled = false;

  return controls;
}
