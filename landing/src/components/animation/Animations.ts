import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function AnimateTitles(): void {
  useGSAP(() => {
    // console.clear();
    const tl = gsap.timeline();
    const titles = document.querySelectorAll("h2, h3, h4");
    if (titles.length === 0) {
      console.warn("No titles found to animate");
      return;
    }

    titles.forEach((title, index) => {
      tl.from(title, {
        scrollTrigger: {
          trigger: title,
          start: "top 80%",
          end: "bottom 50%",
          scrub: true,
        },
        opacity: 0,
        scale: 0.8,
        y: -50,
        duration: 1,
        ease: "power3.out",
        delay: 0.1,
      });
    });
  }, {});
}

/**
 * AnimateFeatures component
 * This component animates the `.feature-item` blocks on the page using GSAP.
 *
 * @returns void
 * @example
 */
function AnimateFeatures(): void {
  useGSAP(() => {
    const tl = gsap.timeline();
    const features = document.querySelectorAll(".feature-item");
    if (features.length === 0) {
      console.warn("No feature items found to animate");
      return;
    }
    features.forEach((feature, index) => {
      tl.from(feature, {
        scrollTrigger: {
          trigger: feature,
          start: "top 80%",
          end: "bottom 50%",
          scrub: true,
        },
        opacity: 0,
        y: 50,
        duration: 1,
        ease: "power3.out",
        delay: index * 0.1, // Stagger the animation
      });
    });
  }, {});
}

/**
 * Animate the app mockup image
 * This component animates the app mockup image on the page using GSAP. As the page scrolls, the image will animate in from the right using the scrollTrigger plugin.
 */
function AnimateAppMockup(): void {
  useGSAP(() => {
    const tl = gsap.timeline();
    const appMockup = document.querySelector(".app-mockup");
    if (appMockup) {
      tl.from(appMockup, {
        scrollTrigger: {
          trigger: appMockup,
          start: "top 80%",
          end: "bottom 50%",
          scrub: true,
        },
        opacity: 0,
        scale: 0.7,
        x: 100,
        duration: 1,
        ease: "power3.out",
        delay: 0.1,
      });
    }
  }, {});
}

export { AnimateTitles, AnimateFeatures, AnimateAppMockup };
