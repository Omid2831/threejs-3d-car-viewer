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
import { gsap } from "gsap";

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
 *              shot transitions, easing, and secondary motion (camera drift) using GSAP.
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

    // View orientation target vector
    this.lookTarget = new THREE.Vector3(0, 0, 0);

    // Active path animation tween and track progress
    this.pathTween = null;
    this.pathProgress = 0;

    // Entrance sweep variables
    this.isEntering = false;
    this.entranceDuration = 4.5; // 4.5 seconds for a majestic entrance sweep
    this.entranceFromPos = new THREE.Vector3(12, 5, 18);
    this.entranceFromLookAt = new THREE.Vector3(0, 0.4, 0);
    this.entranceFromFov = 20; // narrow focus far shot

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
   * Function Name: startEntranceTransition
   * Description: Prepares the camera parameters and starts the entrance transition sweep using GSAP.
   * 
   * Example:
   *   manager.startEntranceTransition();
   */
  startEntranceTransition() {
    this.isEntering = true;

    // Target is the first frame of the first path (Grand Reveal)
    const targetPath = CINEMATIC_PATHS[0];
    const targetPos = targetPath.getPosition(0);
    const targetLookAt = targetPath.getLookAt(0);
    const targetFov = targetPath.getFov(0);

    // Position camera at start coordinates instantly before reveal
    this.camera.position.copy(this.entranceFromPos);
    this.lookTarget.copy(this.entranceFromLookAt);
    this.camera.fov = this.entranceFromFov;
    this.camera.updateProjectionMatrix();

    // Kill any active animations
    gsap.killTweensOf(this.camera.position);
    gsap.killTweensOf(this.lookTarget);
    if (this.pathTween) this.pathTween.kill();

    // Animate camera position
    gsap.to(this.camera.position, {
      x: targetPos.x,
      y: targetPos.y,
      z: targetPos.z,
      duration: this.entranceDuration,
      ease: "power4.inOut"
    });

    // Animate focal target
    gsap.to(this.lookTarget, {
      x: targetLookAt.x,
      y: targetLookAt.y,
      z: targetLookAt.z,
      duration: this.entranceDuration,
      ease: "power4.inOut"
    });

    // Animate field of view
    gsap.to(this.camera, {
      fov: targetFov,
      duration: this.entranceDuration,
      ease: "power4.inOut",
      onUpdate: () => {
        this.camera.updateProjectionMatrix();
      },
      onComplete: () => {
        this.isEntering = false;
        this.startPath(0);
      }
    });
  }

  /**
   * Function Name: startPath
   * Description: Animates the camera along the active cinematic track using GSAP.
   * 
   * Inputs:
   *   - index: number (Path index from 0 to 3)
   * 
   * Example:
   *   manager.startPath(0);
   */
  startPath(index) {
    this.currentPathIndex = index;
    const path = CINEMATIC_PATHS[index];
    this.onPathChange(index);

    // Cancel existing animations to prevent conflicts
    gsap.killTweensOf(this.camera.position);
    gsap.killTweensOf(this.lookTarget);
    if (this.pathTween) this.pathTween.kill();

    this.pathProgress = 0;

    // Tween path progress from 0 to 1
    this.pathTween = gsap.to(this, {
      pathProgress: 1,
      duration: path.duration,
      ease: "none", // cinematic ease is handled in the path update via easing functions
      onUpdate: () => {
        const t = path.easing(this.pathProgress);
        const pos = path.getPosition(t);
        const lookAt = path.getLookAt(t);
        const fov = path.getFov(t);

        this.camera.position.copy(pos);
        this.lookTarget.copy(lookAt);
        this.camera.fov = fov;
        this.camera.updateProjectionMatrix();
      },
      onComplete: () => {
        // Seamlessly transition to the next camera perspective
        const nextIndex = (this.currentPathIndex + 1) % CINEMATIC_PATHS.length;
        this.startTransitionToPath(nextIndex);
      }
    });
  }

  /**
   * Function Name: startTransitionToPath
   * Description: Animates a smooth transition from current camera positions to the start of a path.
   * 
   * Inputs:
   *   - nextIndex: number (Destination path index)
   *   - controlsTarget: THREE.Vector3 (Optional current focal point from manual controls)
   * 
   * Example:
   *   manager.startTransitionToPath(1, controls.target);
   */
  startTransitionToPath(nextIndex, controlsTarget = null) {
    // Kill any running animations
    gsap.killTweensOf(this.camera.position);
    gsap.killTweensOf(this.lookTarget);
    if (this.pathTween) this.pathTween.kill();

    this.currentPathIndex = nextIndex;
    const nextPath = CINEMATIC_PATHS[nextIndex];
    this.onPathChange(nextIndex);

    // If returning from free controls, align lookTarget with current OrbitControls target
    if (controlsTarget) {
      this.lookTarget.copy(controlsTarget);
    }

    const targetPos = nextPath.getPosition(0);
    const targetLookAt = nextPath.getLookAt(0);
    const targetFov = nextPath.getFov(0);

    // Animating coordinates
    gsap.to(this.camera.position, {
      x: targetPos.x,
      y: targetPos.y,
      z: targetPos.z,
      duration: 3.0,
      ease: "power3.inOut"
    });

    gsap.to(this.lookTarget, {
      x: targetLookAt.x,
      y: targetLookAt.y,
      z: targetLookAt.z,
      duration: 3.0,
      ease: "power3.inOut"
    });

    gsap.to(this.camera, {
      fov: targetFov,
      duration: 3.0,
      ease: "power3.inOut",
      onUpdate: () => {
        this.camera.updateProjectionMatrix();
      },
      onComplete: () => {
        // Play path loop once coordinates align
        this.startPath(nextIndex);
      }
    });
  }

  /**
   * Function Name: update
   * Description: Calculates and adds handheld camera drift overlays, and aligns focal direction.
   * 
   * Inputs:
   *   - elapsed: number (Total elapsed seconds from main clock)
   * 
   * Example:
   *   manager.update(clock.getElapsedTime());
   */
  update(elapsed) {
    if (!this.cinematicMode) return;

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

    // Apply drift offset directly to camera position
    this.camera.position.x += this.drift.x;
    this.camera.position.y += this.drift.y;
    this.camera.position.z += this.drift.z;

    // Maintain focal orientation toward lookTarget
    this.camera.lookAt(this.lookTarget);
  }
}
