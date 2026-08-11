// Keep a clean first visit at the top while the embedded assignments finish
// loading. Deep links still open at their requested section, and any user
// input immediately releases the guard.
(() => {
  if (window.location.hash) return;

  if ("scrollRestoration" in window.history) {
    window.history.scrollRestoration = "manual";
  }

  let guardActive = true;

  const resetToTop = () => {
    if (!guardActive || window.location.hash || window.scrollY === 0) return;
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  };

  const releaseGuard = () => {
    guardActive = false;
  };

  for (const eventName of ["wheel", "touchstart", "pointerdown", "keydown"]) {
    window.addEventListener(eventName, releaseGuard, {
      capture: true,
      once: true,
      passive: true,
    });
  }

  resetToTop();
  window.addEventListener("scroll", resetToTop, { passive: true });
  window.addEventListener("pageshow", resetToTop);
  window.addEventListener("load", resetToTop, { once: true });

  document.addEventListener(
    "DOMContentLoaded",
    () => {
      for (const frame of document.querySelectorAll("iframe")) {
        frame.addEventListener("load", resetToTop, { once: true });
      }
    },
    { once: true },
  );
})();
