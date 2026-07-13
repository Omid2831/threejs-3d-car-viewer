/**
 * Module Name: Scene
 * Description: Initializes the ThreeJS Scene, sets background styling, and applies FogExp2.
 */

import * as THREE from "three";

/**
 * Function Name: createScene
 * Description: Creates a new THREE.Scene instance, sets a dark background color, and adds exponential fog.
 * 
 * Inputs:
 *   - backgroundColor: number (Hexadecimal color value for background, e.g., 0x0a0a0f)
 *   - fogColor: number (Hexadecimal color value for fog, e.g., 0x0a0a0f)
 *   - fogDensity: number (Density of FogExp2, e.g., 0.15)
 * 
 * Outputs / Returns:
 *   - THREE.Scene (The configured ThreeJS Scene instance)
 * 
 * Example:
 *   import { createScene } from "./src/core/Scene.js";
 *   const scene = createScene(0x0a0a0f, 0x0a0a0f, 0.15);
 */
export function createScene(backgroundColor = 0x0a0a0f, fogColor = 0x0a0a0f, fogDensity = 0.15) {
  const scene = new THREE.Scene();

  // Set the background color of the scene
  scene.background = new THREE.Color(backgroundColor);

  // Set the exponential fog to blur distant objects and give depth
  scene.fog = new THREE.FogExp2(fogColor, fogDensity);

  return scene;
}
