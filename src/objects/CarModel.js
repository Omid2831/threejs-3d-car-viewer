/**
 * Module Name: CarModel
 * Description: Handles loading of the 3D car model from a GLTF/GLB file, configures shadow casting
 *              and receiving for all sub-meshes, and computes bounding geometry dimensions.
 */

import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

/**
 * Function Name: loadCarModel
 * Description: Instantiates the GLTFLoader, loads the car asset, iterates through child meshes 
 *              to enable shadow parameters, measures dimensions using THREE.Box3, and handles callbacks.
 * 
 * Inputs:
 *   - scene: THREE.Scene (The scene to add the loaded model to)
 *   - modelPath: string (Path to the .glb/.gltf asset file)
 *   - onLoadCallback: Function (Called when loading finishes; receives: model3D, modelCenter, modelRadius)
 *   - onProgressCallback: Function (Optional callback for progress; receives progress percentage 0-100)
 *   - onErrorCallback: Function (Optional callback for handling load errors)
 * 
 * Example:
 *   import { loadCarModel } from "./src/objects/CarModel.js";
 *   loadCarModel(
 *     scene,
 *     "./models/car.glb",
 *     (model, center, radius) => { console.log("Loaded!", model, center, radius); },
 *     (percent) => { console.log(`Loading: ${percent}%`); },
 *     (err) => { console.error("Error loading:", err); }
 *   );
 */
export function loadCarModel(
  scene,
  modelPath = "./models/car.glb",
  onLoadCallback = () => {},
  onProgressCallback = () => {},
  onErrorCallback = () => {}
) {
  const loader = new GLTFLoader();

  loader.load(
    modelPath,
    (gltf) => {
      const model3D = gltf.scene;

      // Reset base position coordinates and scale model down
      model3D.position.set(0, 0, 0);
      model3D.scale.set(0.2, 0.2, 0.2);

      // Traversal function to toggle shadow map settings on all mesh elements
      model3D.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      scene.add(model3D);

      // Extract bounds and spatial dimensions to position the camera accurately
      const modelCenter = new THREE.Vector3(0, 0, 0);
      const box = new THREE.Box3().setFromObject(model3D);
      box.getCenter(modelCenter);
      const modelRadius = box.getSize(new THREE.Vector3()).length() / 2;

      // Invoke success callback with the model and dimensions
      onLoadCallback(model3D, modelCenter, modelRadius);
    },
    (xhr) => {
      // Calculate progress percentage
      if (xhr.total > 0) {
        const pct = Math.round((xhr.loaded / xhr.total) * 100);
        onProgressCallback(pct);
      } else {
        // Fallback progress if Content-Length header is missing or total is 0
        const progressEstimate = Math.min(Math.round((xhr.loaded / 5000000) * 100), 99);
        onProgressCallback(progressEstimate);
      }
    },
    (error) => {
      console.error("An error occurred while loading GLTF/GLB model:", error);
      onErrorCallback(error);
    }
  );
}
