/**
 * Module Name: Ground
 * Description: Generates a circular ground plane mesh with metallic properties for receiving shadows.
 */

import * as THREE from "three";

/**
 * Function Name: createGround
 * Description: Creates a circular geometry, applies a reflective MeshStandardMaterial,
 *              orients it horizontally, configures it to receive shadows, and adds it to the scene.
 * 
 * Inputs:
 *   - scene: THREE.Scene (The scene to add the ground mesh to)
 * 
 * Outputs / Returns:
 *   - THREE.Mesh (The generated ground plane mesh instance)
 * 
 * Example:
 *   import { createGround } from "./src/objects/Ground.js";
 *   const ground = createGround(scene);
 */
export function createGround(scene) {
  // Create a circle geometry with radius 20 and 64 segments for smoothness
  const groundGeometry = new THREE.CircleGeometry(20, 64);

  // Apply standard dark metallic material with low roughness for reflection feel
  const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x111118,
    metalness: 0.8,
    roughness: 0.4,
  });

  const ground = new THREE.Mesh(groundGeometry, groundMaterial);

  // Rotate 90 degrees to align horizontally
  ground.rotation.x = -Math.PI / 2;
  // Offset slightly below y=0 to avoid z-fighting with models lying at exact 0 height
  ground.position.y = -0.01;

  // Ensure ground can receive shadows cast from directional lights
  ground.receiveShadow = true;

  scene.add(ground);

  return ground;
}
