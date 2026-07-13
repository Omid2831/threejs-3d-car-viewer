/**
 * Module Name: Lighting
 * Description: Sets up the ambient, key, fill, rim, and accent lights for the 3D scene,
 *              and provides animation controls for dynamic spot lighting.
 */

import * as THREE from "three";

/**
 * Function Name: setupLighting
 * Description: Instantiates ambient, key, fill, rim, and accent lights, configures shadows 
 *              on the main key light, and adds all of them to the scene.
 * 
 * Inputs:
 *   - scene: THREE.Scene (The active scene object)
 * 
 * Outputs / Returns:
 *   - Object containing references to all created lights:
 *     { ambientLight, keyLight, fillLight, rimLight, accentLight }
 * 
 * Example:
 *   import { setupLighting } from "./src/lights/Lighting.js";
 *   const lights = setupLighting(scene);
 */
export function setupLighting(scene) {
  // Ambient light: Low intensity bluish tint to simulate environment bounce
  const ambientLight = new THREE.AmbientLight(0x222244, 0.6);
  scene.add(ambientLight);

  // Key light: Warm sun-like directional light casting shadows
  const keyLight = new THREE.DirectionalLight(0xffeedd, 2.5);
  keyLight.position.set(5, 8, 4);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.width = 2048;
  keyLight.shadow.mapSize.height = 2048;
  keyLight.shadow.camera.near = 0.5;
  keyLight.shadow.camera.far = 50;
  keyLight.shadow.camera.left = -10;
  keyLight.shadow.camera.right = 10;
  keyLight.shadow.camera.top = 10;
  keyLight.shadow.camera.bottom = -10;
  scene.add(keyLight);

  // Fill light: Cool blue light to soften dark shadows
  const fillLight = new THREE.DirectionalLight(0x88aaff, 1.0);
  fillLight.position.set(-4, 3, -3);
  scene.add(fillLight);

  // Rim light: Strong orange highlight from the rear to separate the car from background
  const rimLight = new THREE.DirectionalLight(0xff6633, 1.8);
  rimLight.position.set(-2, 4, -6);
  scene.add(rimLight);

  // Accent light: A point light placed underneath the model for dramatic floor glow
  const accentLight = new THREE.PointLight(0x4488ff, 1.5, 15);
  accentLight.position.set(0, -1, 0);
  scene.add(accentLight);

  return {
    ambientLight,
    keyLight,
    fillLight,
    rimLight,
    accentLight,
  };
}

/**
 * Function Name: animateAccentLight
 * Description: Modulates the intensity and shifts the hue of the accent point light over time.
 * 
 * Inputs:
 *   - accentLight: THREE.PointLight (The light source to animate)
 *   - elapsed: number (Total elapsed seconds from the main clock)
 * 
 * Example:
 *   animateAccentLight(lights.accentLight, clock.getElapsedTime());
 */
export function animateAccentLight(accentLight, elapsed) {
  if (!accentLight) return;

  // Pulsate intensity slightly
  accentLight.intensity = 1.2 + Math.sin(elapsed * 0.8) * 0.4;

  // Modulate HSL hue to create a moving color effect (around blue-cyan-purple spectrum)
  accentLight.color.setHSL(
    (0.6 + Math.sin(elapsed * 0.3) * 0.1) % 1,
    0.7,
    0.5
  );
}
