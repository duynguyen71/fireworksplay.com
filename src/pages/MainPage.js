import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { AppStoreBadge, PlayStoreBadge } from "../components/StoreBadges";
import ImageSlider from "../components/ImageSlider";
import { SlideData } from "../data/SlideData";

const sectionReveal = {
  hidden: { opacity: 0.65, y: 48 },
  visible: { opacity: 1, y: 0 },
};

// Preserve the hero and scroll invariants in docs/homepage-contract.md.
export default function MainPage() {
  const shouldReduceMotion = useReducedMotion();
  const [loadHeroVideo, setLoadHeroVideo] = useState(false);
  const [heroVideoReady, setHeroVideoReady] = useState(false);

  const scrollToAnnouncement = () => {
    const target = document.querySelector(".game-spotlight");
    if (!target) return;

    target.scrollIntoView({ block: "start" });
  };

  useEffect(() => {
    if (!shouldReduceMotion) setLoadHeroVideo(true);
  }, [shouldReduceMotion]);

  return (
    <main id="main-content" className="home">
      <section className="home-hero" aria-labelledby="home-title">
        <div className="hero-video-wrap" aria-hidden="true">
          {loadHeroVideo && (
            <iframe
              className={`hero-video${heroVideoReady ? " is-ready" : ""}`}
              src="https://www.youtube-nocookie.com/embed/viQ2JorDcSs?autoplay=1&mute=1&controls=0&loop=1&playlist=viQ2JorDcSs&playsinline=1&rel=0&modestbranding=1&disablekb=1&iv_load_policy=3"
              title="Fireworks Play trailer background"
              tabIndex="-1"
              allow="autoplay; encrypted-media"
              loading="eager"
              onLoad={() => setHeroVideoReady(true)}
            />
          )}
        </div>
        <div className="hero-edge-shade" aria-hidden="true" />
        <div className="home-hero-content">
          <p className="eyebrow studio-word"><span className="studio-sim">Sim</span>play Studio</p>
          <h1 id="home-title">
            <img className="hero-logo" src="/GameLabel-clean.webp" alt="Fireworks Play" width="457" height="296" fetchpriority="high" />
          </h1>
          <p className="hero-description">Fun and amazing fireworks simulator that will blow your mind!</p>
          <div className="store-links" aria-label="Download Fireworks Play">
            <PlayStoreBadge />
            <AppStoreBadge />
          </div>
          <div className="hero-catalog-links">
            <Link className="text-link" to="/fireworks/">Browse fireworks <span aria-hidden="true">→</span></Link>
            <Link className="text-link" to="/racks/">Browse racks <span aria-hidden="true">→</span></Link>
            <Link className="text-link" to="/release-note/">Release notes <span aria-hidden="true">→</span></Link>
            <a className="text-link" href="/privacy.html">Privacy <span aria-hidden="true">→</span></a>
          </div>
        </div>
        <motion.button
          type="button"
          className="hero-scroll-hint"
          aria-label="Scroll down"
          onClick={scrollToAnnouncement}
          whileHover={shouldReduceMotion ? undefined : { y: 2 }}
          whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
        >
          <motion.span
            aria-hidden="true"
            animate={shouldReduceMotion ? undefined : { y: [0, 5, 0] }}
            transition={shouldReduceMotion ? undefined : { duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          >
            <svg viewBox="0 0 24 24" focusable="false">
              <path d="M5 8.5 12 15.5 19 8.5" />
            </svg>
          </motion.span>
        </motion.button>
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
            <img
              className="new-game-hero-image"
              src="/images/fireworks_show_simulator_library_hero-1280.webp"
              srcSet="/images/fireworks_show_simulator_library_hero-1280.webp 1280w, /images/fireworks_show_simulator_library_hero-2400.webp 2400w"
              sizes="(max-width: 800px) calc(100vw - 48px), min(1216px, calc(100vw - 64px))"
              alt=""
              width="3840"
              height="1240"
              loading="lazy"
              decoding="async"
            />
            <div className="new-game-content">
              <p className="new-game-badge">Coming to Steam</p>
              <h2 id="game-spotlight-title" className="new-game-logo-heading">
                <img
                  className="new-game-logo"
                  src="/fireworks-show-simulator-logo-dirt-500.webp"
                  srcSet="/fireworks-show-simulator-logo-dirt-500.webp 500w, /fireworks-show-simulator-logo-dirt-860.webp 860w"
                  sizes="(max-width: 600px) 250px, 430px"
                  alt="Fireworks Show Simulator"
                  width="1920"
                  height="1080"
                  loading="lazy"
                  decoding="async"
                />
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
