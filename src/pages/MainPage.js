import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { FaSteam, FaBullhorn } from "react-icons/fa";
import { AppStoreBadge, PlayStoreBadge } from "../components/StoreBadges";
import FeatureCard from "../components/FeatureCard";
import { FeatureSections } from "../data/FeatureSections";

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
          <p className="eyebrow studio-word">
            <a className="studio-link" href="https://simplaystudio.com/"><span className="studio-sim">Sim</span>play Studio</a>
          </p>
          <h1 id="home-title">
            <img className="hero-logo" src="/GameLabel-clean.webp" alt="Fireworks Play" width="457" height="296" fetchpriority="high" />
          </h1>
          <p className="hero-description">
            <span className="hero-description-line">Fun and amazing fireworks simulator</span>
            <span className="hero-description-line">that will blow your mind!</span>
          </p>
          <div className="store-links" aria-label="Download Fireworks Play">
            <PlayStoreBadge />
            <AppStoreBadge />
          </div>
          <div className="hero-catalog-links">
            <Link className="text-link" to="/fireworks/">Explore game items</Link>
            <Link className="text-link" to="/release-note/">Release notes</Link>
            <a className="text-link" href="/privacy.html">Privacy</a>
          </div>
        </div>
        <motion.button
          type="button"
          className="hero-scroll-hint"
          aria-label="Scroll down"
          onClick={scrollToAnnouncement}
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <span aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false">
              <path d="M5 8.5 12 15.5 19 8.5" />
            </svg>
          </span>
        </motion.button>
      </section>
      <motion.section
        className="game-spotlight"
        aria-labelledby="game-spotlight-title"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div>
          <div className="game-spotlight-heading">
            <p className="eyebrow eyebrow--announce"><FaBullhorn aria-hidden="true" />New Game Announcement</p>
            <p className="game-spotlight-intro">The next fireworks game from <a className="studio-link" href="https://simplaystudio.com/">Simplay Studio</a> is coming to PC.</p>
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
              <p>Design professional fireworks displays from a top-down view. Watch your show from any viewpoint in a fully 3D world. Place racks, load shells, connect fuses, and control the firing system.</p>
              <div className="new-game-links">
                <a className="steam-link" href="https://store.steampowered.com/app/4668450/Fireworks_Show_Simulator" target="_blank" rel="noopener noreferrer"><FaSteam aria-hidden="true" />Wishlist on Steam</a>
                <a className="text-link" href="https://fireworksshowsimulator.com/" target="_blank" rel="noopener noreferrer">Explore the Game</a>
              </div>
            </div>
          </div>
        </div>
      </motion.section>
      <section className="features-section" aria-label="Explore Fireworks Play">
        <div>
          <div className="feature-list">
            {FeatureSections.map((feature, index) => (
              <FeatureCard key={feature.title} feature={feature} reverse={index % 2 === 1} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
