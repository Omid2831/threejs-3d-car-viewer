/**
 * Module Name: Camera
 * Description: Handles creation of the perspective camera, definition of easing functions,
 *              cinematic camera tracks, and the core CinematicCameraManager state machine.
 */

import * as THREE from "three";

/**
 * Easing functions for buttery smooth camera transitions.
 */
export const easing = {
  easeInOutCubic: (t) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  easeInOutSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
  easeInOutQuart: (t) =>
    t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2,
  easeInOutQuint: (t) =>
    t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2,
};

/**
 * Smooth-step helper for extra creamy interpolation.
 * 
 * Inputs:
 *   - a: number (Start value)
 *   - b: number (End value)
 *   - t: number (Interpolation factor, between 0 and 1)
 * 
 * Outputs / Returns:
 *   - number (Interpolated value)
 */
export function smoothstep(a, b, t) {
  t = Math.max(0, Math.min(1, t));
  t = t * t * (3 - 2 * t);
  return a + (b - a) * t;
}

/**
 * 4 cinematic camera perspectives — each one a mini movie scene
 */
export const CINEMATIC_PATHS = [
  // ── PERSPECTIVE 1: Grand Reveal ──
  {
    name: "Grand Reveal",
    duration: 12,
    easing: easing.easeInOutQuint,
    getPosition: (t) => {
      const angle = THREE.MathUtils.lerp(-0.3, 0.6, t);
      const radius = smoothstep(7.0, 4.0, t);
      const height = smoothstep(4.5, 1.2, t);
      return new THREE.Vector3(
        Math.sin(angle) * radius,
        height,
        Math.cos(angle) * radius
      );
    },
    getLookAt: (t) => {
      return new THREE.Vector3(
        smoothstep(0, 0.1, t),
        smoothstep(0.8, 0.35, t),
        smoothstep(0, -0.1, t)
      );
    },
    getFov: (t) => smoothstep(30, 46, t),
  },

  // ── PERSPECTIVE 2: Low Prowl ──
  {
    name: "Low Prowl",
    duration: 10,
    easing: easing.easeInOutSine,
    getPosition: (t) => {
      const z = THREE.MathUtils.lerp(-4.0, 4.0, t);
      const xCurve = Math.sin(t * Math.PI) * 0.6;
      const x = 3.0 - xCurve;
      const y = smoothstep(0.45, 0.7, Math.sin(t * Math.PI));
      return new THREE.Vector3(x, y, z);
    },
    getLookAt: (t) => {
      return new THREE.Vector3(
        smoothstep(-0.3, 0.3, t),
        smoothstep(0.35, 0.55, Math.sin(t * Math.PI)),
        smoothstep(-1.0, 1.0, t)
      );
    },
    getFov: (t) => smoothstep(32, 42, Math.sin(t * Math.PI)),
  },

  // ── PERSPECTIVE 3: Rear Drama ──
  {
    name: "Rear Drama",
    duration: 11,
    easing: easing.easeInOutQuart,
    getPosition: (t) => {
      const angle = THREE.MathUtils.lerp(Math.PI + 0.4, Math.PI - 0.4, t);
      const radius = smoothstep(3.5, 5.0, t);
      const height = smoothstep(0.4, 2.8, t);
      return new THREE.Vector3(
        Math.sin(angle) * radius,
        height,
        Math.cos(angle) * radius
      );
    },
    getLookAt: (t) => {
      return new THREE.Vector3(
        smoothstep(0.2, -0.15, t),
        smoothstep(0.25, 0.6, t),
        smoothstep(0.3, 0, t)
      );
    },
    getFov: (t) => smoothstep(36, 50, t),
  },

  // ── PERSPECTIVE 4: Orbital Glide ──
  {
    name: "Orbital Glide",
    duration: 16,
    easing: easing.easeInOutCubic,
    getPosition: (t) => {
      const angle = THREE.MathUtils.lerp(0.3, Math.PI * 1.8, t);
      const radiusPulse = Math.sin(t * Math.PI * 2) * 0.4;
      const radius = 4.8 + radiusPulse;
      const height = 1.8 + Math.sin(t * Math.PI) * 0.7;
      return new THREE.Vector3(
        Math.sin(angle) * radius,
        height,
        Math.cos(angle) * radius
      );
    },
    getLookAt: (t) => {
      return new THREE.Vector3(
        0,
        0.3 + Math.sin(t * Math.PI * 2) * 0.1,
        0
      );
    },
    getFov: (t) => 44 + Math.sin(t * Math.PI) * 4,
  },
];

/**
 * Function Name: createCamera
 * Description: Initializes a PerspectiveCamera with cinematic aspect ratio bounds.
 * 
 * Inputs:
 *   - width: number (Viewport width)
 *   - height: number (Viewport height)
 * 
 * Outputs / Returns:
 *   - THREE.PerspectiveCamera (The initialized camera)
 * 
 * Example:
 *   const camera = createCamera(window.innerWidth, window.innerHeight);
 */
export function createCamera(width, height) {
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  camera.position.set(4, 2, 6);
  camera.lookAt(0, 0, 0);
  return camera;
}

/**
 * Class Name: CinematicCameraManager
 * Description: Manages the active state of the camera (Cinematic vs Manual Mode),
 *              shot transitions, easing, and secondary motion (camera drift).
 */
export class CinematicCameraManager {
  /**
   * Constructor for CinematicCameraManager
   * 
   * Inputs:
   *   - camera: THREE.PerspectiveCamera (The camera to be animated)
   *   - onPathChange: Function (Callback when starting a new path, receives path index)
   */
  constructor(camera, onPathChange = () => {}) {
    this.camera = camera;
    this.onPathChange = onPathChange;

    this.cinematicMode = true;
    this.currentPathIndex = 0;
    this.pathStartTime = 0;

    // Transition blending variables
    this.isTransitioning = false;
    this.transitionStart = 0;
    this.transitionDuration = 3.0; // 3 seconds blend time

    this.transitionFromPos = new THREE.Vector3();
    this.transitionFromLookAt = new THREE.Vector3();
    this.transitionFromFov = 45;

    this.transitionToPos = new THREE.Vector3();
    this.transitionToLookAt = new THREE.Vector3();
    this.transitionToFov = 45;

    // Micro camera drift (handheld effect)
    this.drift = {
      x: 0,
      y: 0,
      z: 0,
      intensity: 0.012,
      speed: 0.4,
    };
  }

  /**
   * Function Name: startPath
   * Description: Sets the active camera path index and resets path timing parameters.
   * 
   * Inputs:
   *   - index: number (Path index from 0 to 3)
   *   - elapsed: number (Total elapsed seconds from main clock)
   * 
   * Example:
   *   manager.startPath(0, clock.getElapsedTime());
   */
  startPath(index, elapsed) {
    this.currentPathIndex = index;
    this.pathStartTime = elapsed;
    this.onPathChange(index);
  }

  /**
   * Function Name: startTransitionToPath
   * Description: Captures current camera state and sets target camera parameters to begin a blended transition.
   * 
   * Inputs:
   *   - nextIndex: number (Destination path index)
   *   - elapsed: number (Total elapsed seconds from main clock)
   * 
   * Example:
   *   manager.startTransitionToPath(1, clock.getElapsedTime());
   */
  startTransitionToPath(nextIndex, elapsed) {
    this.isTransitioning = true;
    this.transitionStart = elapsed;

    // Capture current camera state as start coordinates
    this.transitionFromPos.copy(this.camera.position);

    // Form lookAt target vector from current camera view direction vector
    const dir = new THREE.Vector3();
    this.camera.getWorldDirection(dir);
    this.transitionFromLookAt.copy(this.camera.position).add(dir.multiplyScalar(5));
    this.transitionFromFov = this.camera.fov;

    // Retrieve target coordinates from the first frame of the next shot
    const nextPath = CINEMATIC_PATHS[nextIndex];
    this.transitionToPos.copy(nextPath.getPosition(0));
    this.transitionToLookAt.copy(nextPath.getLookAt(0));
    this.transitionToFov = nextPath.getFov(0);

    this.currentPathIndex = nextIndex;
    this.onPathChange(nextIndex);
  }

  /**
   * Function Name: update
   * Description: Evaluates coordinates along the active track, adds noise for drift,
   *              and updates position, focal targets, and fields-of-view.
   * 
   * Inputs:
   *   - elapsed: number (Total elapsed seconds from main clock)
   * 
   * Example:
   *   manager.update(clock.getElapsedTime());
   */
  update(elapsed) {
    if (!this.cinematicMode) return;

    const path = CINEMATIC_PATHS[this.currentPathIndex];

    // Compute handheld micro-drift offsets
    this.drift.x =
      Math.sin(elapsed * this.drift.speed * 1.3) *
      Math.cos(elapsed * this.drift.speed * 0.7) *
      this.drift.intensity;
    this.drift.y =
      Math.sin(elapsed * this.drift.speed * 0.9 + 1.0) *
      Math.cos(elapsed * this.drift.speed * 0.5) *
      this.drift.intensity * 0.7;
    this.drift.z =
      Math.cos(elapsed * this.drift.speed * 1.1 + 2.0) *
      Math.sin(elapsed * this.drift.speed * 0.6) *
      this.drift.intensity;

    if (this.isTransitioning) {
      const tRaw = (elapsed - this.transitionStart) / this.transitionDuration;
      const t = Math.min(tRaw, 1);
      const eased = easing.easeInOutQuint(t);

      const pos = new THREE.Vector3().lerpVectors(
        this.transitionFromPos,
        this.transitionToPos,
        eased
      );
      const lookAt = new THREE.Vector3().lerpVectors(
        this.transitionFromLookAt,
        this.transitionToLookAt,
        eased
      );
      const fov = THREE.MathUtils.lerp(this.transitionFromFov, this.transitionToFov, eased);

      // Apply drift overlay
      pos.x += this.drift.x;
      pos.y += this.drift.y;
      pos.z += this.drift.z;

      this.camera.position.copy(pos);
      this.camera.lookAt(lookAt);
      this.camera.fov = fov;
      this.camera.updateProjectionMatrix();

      if (t >= 1) {
        this.isTransitioning = false;
        this.pathStartTime = elapsed;
      }
      return;
    }

    // Standard camera path motion
    const pathElapsed = elapsed - this.pathStartTime;
    const tRaw = pathElapsed / path.duration;

    if (tRaw >= 1) {
      // Loop seamlessly to next cinematic camera perspective
      const nextIndex = (this.currentPathIndex + 1) % CINEMATIC_PATHS.length;
      this.startTransitionToPath(nextIndex, elapsed);
      return;
    }

    const t = path.easing(tRaw);
    const pos = path.getPosition(t);
    const lookAt = path.getLookAt(t);
    const fov = path.getFov(t);

    // Apply drift overlay
    pos.x += this.drift.x;
    pos.y += this.drift.y;
    pos.z += this.drift.z;

    this.camera.position.copy(pos);
    this.camera.lookAt(lookAt);
    this.camera.fov = fov;
    this.camera.updateProjectionMatrix();
  }
}
