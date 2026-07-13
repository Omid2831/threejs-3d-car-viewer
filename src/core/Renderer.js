/**
 * Module Name: Renderer
 * Description: Initializes the ThreeJS WebGLRenderer, configures features (shadows, tone mapping,
 *              color spaces, antialiasing), and provides utility functions to resize the output.
 */

import * as THREE from "three";

/**
 * Function Name: createRenderer
 * Description: Instantiates and sets up a THREE.WebGLRenderer with tone mapping, exposure,
 *              color spaces, and shadow map support.
 * 
 * Inputs:
 *   - canvas: HTMLCanvasElement (The DOM canvas element)
 *   - width: number (Viewport width)
 *   - height: number (Viewport height)
 * 
 * Outputs / Returns:
 *   - THREE.WebGLRenderer (The configured renderer instance)
 * 
 * Example:
 *   const canvas = document.getElementById("myCanvas");
 *   const renderer = createRenderer(canvas, window.innerWidth, window.innerHeight);
 */
export function createRenderer(canvas, width, height) {
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true,
  });

  // Set the canvas rendering size and match it to high-DPI displays
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Enable shadow maps for realistic rendering
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // Set filmic tone mapping for cinematic rendering colors
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  return renderer;
}

/**
 * Function Name: updateRendererSize
 * Description: Updates the size and pixel ratio of the renderer on viewport resize.
 * 
 * Inputs:
 *   - renderer: THREE.WebGLRenderer (The active renderer)
 *   - width: number (New width in pixels)
 *   - height: number (New height in pixels)
 * 
 * Example:
 *   window.addEventListener("resize", () => {
 *     updateRendererSize(renderer, window.innerWidth, window.innerHeight);
 *   });
 */
export function updateRendererSize(renderer, width, height) {
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}
