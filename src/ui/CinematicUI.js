/**
 * Module Name: CinematicUI
 * Description: Dynamically generates DOM overlays for Cinematic Letterboxing, active camera indicators,
 *              mode displays, and updates their text, sizes, and states.
 */

import { gsap } from "gsap";

/**
 * Function Name: createCinematicUI
 * Description: Generates and appends HTML/CSS elements to the DOM for letterbox bars,
 *              a dot-matrix camera indicator, labels, and mode indicators.
 * 
 * Inputs:
 *   - numCameras: number (Number of camera paths to display indicator dots for)
 * 
 * Example:
 *   import { createCinematicUI } from "./src/ui/CinematicUI.js";
 *   createCinematicUI(4);
 */
export function createCinematicUI(numCameras = 4) {
  // Top letterbox bar
  const topBar = document.createElement("div");
  topBar.id = "letterbox-top";
  Object.assign(topBar.style, {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100%",
    height: "8vh",
    background: "linear-gradient(to bottom, #000 60%, transparent)",
    zIndex: "10",
    pointerEvents: "none",
    transition: "height 1.5s cubic-bezier(0.22, 1, 0.36, 1)",
  });
  document.body.appendChild(topBar);

  // Bottom letterbox bar
  const bottomBar = document.createElement("div");
  bottomBar.id = "letterbox-bottom";
  Object.assign(bottomBar.style, {
    position: "fixed",
    bottom: "0",
    left: "0",
    width: "100%",
    height: "8vh",
    background: "linear-gradient(to top, #000 60%, transparent)",
    zIndex: "10",
    pointerEvents: "none",
    transition: "height 1.5s cubic-bezier(0.22, 1, 0.36, 1)",
  });
  document.body.appendChild(bottomBar);

  // Camera indicator container
  const indicator = document.createElement("div");
  indicator.id = "cam-indicator";
  Object.assign(indicator.style, {
    position: "fixed",
    bottom: "10vh",
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    zIndex: "20",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    opacity: "0",
    transition: "opacity 1.2s ease",
    pointerEvents: "none",
  });

  // Dots for each cinematic camera angle
  for (let i = 0; i < numCameras; i++) {
    const dot = document.createElement("div");
    dot.classList.add("cam-dot");
    Object.assign(dot.style, {
      width: "8px",
      height: "8px",
      borderRadius: "50%",
      background: "rgba(255,255,255,0.2)",
      transition: "all 0.8s cubic-bezier(0.22, 1, 0.36, 1)",
      boxShadow: "none",
    });
    indicator.appendChild(dot);
  }

  // Camera path name label
  const label = document.createElement("div");
  label.id = "cam-label";
  Object.assign(label.style, {
    color: "rgba(255,255,255,0.4)",
    fontSize: "11px",
    letterSpacing: "3px",
    textTransform: "uppercase",
    marginLeft: "8px",
    transition: "opacity 0.6s ease-in",
  });
  label.textContent = "";
  indicator.appendChild(label);

  document.body.appendChild(indicator);

  // Active Mode label (top-right overlay)
  const modeLabel = document.createElement("div");
  modeLabel.id = "mode-label";
  Object.assign(modeLabel.style, {
    position: "fixed",
    top: "10vh",
    right: "5vw",
    color: "rgba(255,255,255,0.25)",
    fontSize: "10px",
    letterSpacing: "4px",
    textTransform: "uppercase",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    zIndex: "20",
    pointerEvents: "none",
    opacity: "0",
    transition: "opacity 1.2s ease",
  });
  modeLabel.textContent = "Cinematic Mode";
  document.body.appendChild(modeLabel);

  // Fade in the UI overlays after a brief pause
  setTimeout(() => {
    indicator.style.opacity = "1";
    modeLabel.style.opacity = "1";
  }, 800);
}

/**
 * Function Name: updateCameraIndicator
 * Description: Highlights the active indicator dot (widening it into a pill shape with glow)
 *              and fades out/in the text label showing the current angle name.
 * 
 * Inputs:
 *   - index: number (Active camera track index)
 *   - name: string (Name of the active camera perspective)
 * 
 * Example:
 *   updateCameraIndicator(0, "Grand Reveal");
 */
export function updateCameraIndicator(index, name) {
  const dots = document.querySelectorAll(".cam-dot");
  dots.forEach((dot, i) => {
    if (i === index) {
      dot.style.background = "rgba(255,255,255,0.9)";
      dot.style.width = "20px";
      dot.style.borderRadius = "4px";
      dot.style.boxShadow = "0 0 10px rgba(255,255,255,0.4)";
    } else {
      dot.style.background = "rgba(255,255,255,0.2)";
      dot.style.width = "8px";
      dot.style.borderRadius = "50%";
      dot.style.boxShadow = "none";
    }
  });

  const label = document.getElementById("cam-label");
  if (label) {
    label.style.opacity = "0";
    setTimeout(() => {
      label.textContent = name;
      label.style.opacity = "1";
    }, 300);
  }
}

/**
 * Function Name: setCinematicUIState
 * Description: Adjusts height styles of letterbox bars and updates the mode label text.
 * 
 * Inputs:
 *   - cinematicMode: boolean (True if in Cinematic Mode; False if in Free Camera Mode)
 * 
 * Example:
 *   setCinematicUIState(false); // Changes style to Free Camera Mode
 */
export function setCinematicUIState(cinematicMode) {
  const modeLabel = document.getElementById("mode-label");
  const topBar = document.getElementById("letterbox-top");
  const bottomBar = document.getElementById("letterbox-bottom");
  const indicator = document.getElementById("cam-indicator");

  if (cinematicMode) {
    if (modeLabel) modeLabel.textContent = "Cinematic Mode";
    if (topBar) topBar.style.height = "8vh";
    if (bottomBar) bottomBar.style.height = "8vh";
    if (indicator) indicator.style.opacity = "1";
  } else {
    if (modeLabel) modeLabel.textContent = "Free Camera";
    // Collapse letterbox bars into screen edges in free controls mode
    if (topBar) topBar.style.height = "0";
    if (bottomBar) bottomBar.style.height = "0";
    if (indicator) indicator.style.opacity = "0";
  }
}

/**
 * Function Name: hideLoadingOverlay
 * Description: Transitions out the loading screen using GSAP. Fades/slides up the loading content,
 *              slides down the background panel, triggers a camera movement callback, and
 *              finally removes the preloader overlay from screen space.
 * 
 * Inputs:
 *   - onRevealCallback: Function (Callback executed when the 3D scene starts to be revealed)
 * 
 * Example:
 *   hideLoadingOverlay(() => { cameraManager.startEntranceTransition(elapsed); });
 */
export function hideLoadingOverlay(onRevealCallback = () => {}) {
  const preloaderContent = document.getElementById("preloader-content");
  const preloader = document.getElementById("preloader");

  if (!preloader) return;

  const tl = gsap.timeline({
    onComplete: () => {
      preloader.style.display = "none";
    }
  });

  // 1. Fade/slide up the loading text/elements
  if (preloaderContent) {
    tl.to(preloaderContent, {
      opacity: 0,
      y: -30,
      duration: 0.8,
      ease: "power2.out"
    });
  }

  // 2. Slide the whole screen down to uncover the canvas
  tl.to(preloader, {
    yPercent: 100,
    duration: 1.6,
    ease: "power3.inOut",
    onStart: onRevealCallback
  }, "-=0.2"); // Overlap slightly for dynamic pacing
}

/**
 * Function Name: updateLoadingProgress
 * Description: Smoothly animates the horizontal preloader line width and counts up the text counter.
 * 
 * Inputs:
 *   - percentage: number (Percentage value from 0 to 100)
 * 
 * Example:
 *   updateLoadingProgress(75);
 */
export function updateLoadingProgress(percentage) {
  const fill = document.getElementById("loader-line-fill");
  const pctText = document.getElementById("preloader-pct");

  // Animate the line width
  if (fill) {
    gsap.to(fill, {
      width: percentage + "%",
      duration: 0.4,
      ease: "power1.out"
    });
  }

  // Animate the text counting up
  if (pctText) {
    const currentVal = parseInt(pctText.textContent) || 0;
    const targetObj = { val: currentVal };
    gsap.to(targetObj, {
      val: percentage,
      duration: 0.4,
      ease: "power1.out",
      onUpdate: () => {
        pctText.textContent = Math.round(targetObj.val) + "%";
      }
    });
  }
}
