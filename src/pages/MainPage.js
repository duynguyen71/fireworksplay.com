import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { animate, motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { AppStoreBadge, PlayStoreBadge } from "../components/StoreBadges";
import ImageSlider from "../components/ImageSlider";
import { SlideData } from "../data/SlideData";

const sectionReveal = {
  hidden: { opacity: 0.65, y: 48 },
  visible: { opacity: 1, y: 0 },
};
const scrollEdgeTolerance = 4;
const scrollUnlockDelay = 160;

function getPageTop(element) {
  return element.getBoundingClientRect().top + window.scrollY;
}

export default function MainPage() {
  const [isHeroVideoPlaying, setIsHeroVideoPlaying] = useState(true);
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const smoothScrollProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("home-scroll-snap");

    return () => root.classList.remove("home-scroll-snap");
  }, []);

  useEffect(() => {
    if (shouldReduceMotion) return undefined;

    const root = document.documentElement;
    const sections = Array.from(document.querySelectorAll(".home > section"));
    const footer = document.querySelector(".site-footer");
    const scrollTargets = footer ? [...sections, footer] : sections;
    let activeAnimation = null;
    let unlockTimer = null;
    let isScrollLocked = false;

    const clearUnlockTimer = () => {
      if (unlockTimer !== null) window.clearTimeout(unlockTimer);
    };

    const unlockAfterGesture = () => {
      clearUnlockTimer();
      unlockTimer = window.setTimeout(() => {
        isScrollLocked = false;
        unlockTimer = null;
      }, scrollUnlockDelay);
    };

    const scrollToTarget = (target) => {
      const destination = getPageTop(target);
      isScrollLocked = true;
      root.classList.add("is-section-scrolling");

      activeAnimation = animate(window.scrollY, destination, {
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1],
        onUpdate: (value) => window.scrollTo(0, value),
        onComplete: () => {
          window.scrollTo(0, destination);
          activeAnimation = null;
          root.classList.remove("is-section-scrolling");
          unlockAfterGesture();
        },
      });
    };

    const handleWheel = (event) => {
      const isVerticalScroll = Math.abs(event.deltaY) > Math.abs(event.deltaX);
      if (event.ctrlKey || event.defaultPrevented || !isVerticalScroll || Math.abs(event.deltaY) < 4) return;
      if (document.querySelector('[role="dialog"]')) return;

      if (isScrollLocked) {
        event.preventDefault();
        if (activeAnimation === null) unlockAfterGesture();
        return;
      }

      const scrollPosition = window.scrollY;
      let currentIndex = 0;

      for (let index = 1; index < scrollTargets.length; index += 1) {
        if (getPageTop(scrollTargets[index]) > scrollPosition + scrollEdgeTolerance) break;
        currentIndex = index;
      }

      const currentTarget = scrollTargets[currentIndex];
      const currentTop = getPageTop(currentTarget);
      const currentHeight = currentTarget.getBoundingClientRect().height;
      const currentBottom = currentTop + currentHeight;
      const direction = event.deltaY > 0 ? 1 : -1;
      const canMoveDown = direction === 1
        && currentIndex < scrollTargets.length - 1
        && (currentHeight <= window.innerHeight + scrollEdgeTolerance
          || scrollPosition >= currentBottom - window.innerHeight - scrollEdgeTolerance);
      const canMoveUp = direction === -1
        && currentIndex > 0
        && scrollPosition <= currentTop + scrollEdgeTolerance;

      if (!canMoveDown && !canMoveUp) return;

      event.preventDefault();
      scrollToTarget(scrollTargets[currentIndex + direction]);
    };

    window.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      window.removeEventListener("wheel", handleWheel);
      clearUnlockTimer();
      activeAnimation?.stop();
      root.classList.remove("is-section-scrolling");
    };
  }, [shouldReduceMotion]);

  return (
    <main id="main-content" className="home">
      <motion.div className="scroll-progress" style={{ scaleX: smoothScrollProgress }} aria-hidden="true" />
      <section className="home-hero" aria-labelledby="home-title">
        <div className="hero-video-wrap" aria-hidden="true">
          {isHeroVideoPlaying && (
            <iframe
              className="hero-video"
              src="https://www.youtube-nocookie.com/embed/viQ2JorDcSs?autoplay=1&mute=1&controls=0&loop=1&playlist=viQ2JorDcSs&playsinline=1&rel=0&modestbranding=1&disablekb=1&iv_load_policy=3"
              title="Fireworks Play trailer background"
              tabIndex="-1"
              allow="autoplay; encrypted-media"
              loading="eager"
            />
          )}
        </div>
        <div className="hero-shade" aria-hidden="true" />
        <div className="home-hero-content">
          <p className="eyebrow studio-word"><span className="studio-sim">Sim</span>play Studio</p>
          <h1 id="home-title">
            <img className="hero-logo" src="/GameLabel.png" alt="Fireworks Play" width="457" height="296" />
          </h1>
          <p className="hero-description">Fun and amazing fireworks simulator that will blow your mind!</p>
          <div className="store-links" aria-label="Download Fireworks Play">
            <PlayStoreBadge />
            <AppStoreBadge />
          </div>
          <div className="hero-catalog-links">
            <Link className="text-link" to="/fireworks">Browse fireworks <span aria-hidden="true">→</span></Link>
            <Link className="text-link" to="/racks">Browse racks <span aria-hidden="true">→</span></Link>
            <Link className="text-link" to="/release-note">Release notes <span aria-hidden="true">→</span></Link>
            <a className="text-link" href="/privacy.html">Privacy <span aria-hidden="true">→</span></a>
          </div>
        </div>
        <button className="hero-video-toggle" type="button" onClick={() => setIsHeroVideoPlaying((isPlaying) => !isPlaying)}>
          {isHeroVideoPlaying ? "Pause Video" : "Play Video"}
        </button>
      </section>
      <section className="game-spotlight" aria-labelledby="game-spotlight-title">
        <motion.div
          variants={sectionReveal}
          initial={shouldReduceMotion ? false : "hidden"}
          whileInView="visible"
          viewport={{ amount: 0.2 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="game-spotlight-heading">
            <p className="eyebrow">New Game Announcement</p>
            <p className="game-spotlight-intro">The next fireworks game from Simplay Studio is coming to PC.</p>
          </div>
          <div className="new-game-card">
            <div className="new-game-content">
              <p className="new-game-badge">Coming to Steam</p>
              <h2 id="game-spotlight-title" className="new-game-logo-heading">
                <img className="new-game-logo" src="/fireworks-show-simulator-logo-dirt.png" alt="Fireworks Show Simulator" width="1920" height="1080" />
              </h2>
              <h3>Play. Load. Link. Save. Watch.</h3>
              <p>Design professional fireworks displays from a top-down view. Watch your show from any viewpoint in a fully 3D world. Place racks, load shells, connect fuses, and control the firing system.</p>
              <div className="new-game-links">
                <a className="steam-link" href="https://store.steampowered.com/app/4668450/Fireworks_Show_Simulator" target="_blank" rel="noopener noreferrer">Wishlist on Steam</a>
                <a className="text-link" href="https://fireworksshowsimulator.com/" target="_blank" rel="noopener noreferrer">Explore the Game <span aria-hidden="true">→</span></a>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
      <section className="gallery-section" aria-labelledby="gallery-title">
        <motion.div
          variants={sectionReveal}
          initial={shouldReduceMotion ? false : "hidden"}
          whileInView="visible"
          viewport={{ amount: 0.2 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="section-heading">
            <h2 id="gallery-title">Explore Fireworks Play</h2>
            <p>Fireworks, maps, and multiplayer.</p>
          </div>
          <ImageSlider slides={SlideData} />
        </motion.div>
      </section>
    </main>
  );
}
