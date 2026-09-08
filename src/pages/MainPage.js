import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { AppStoreBadge, PlayStoreBadge } from "../components/StoreBadges";
import ImageSlider from "../components/ImageSlider";
import { SlideData } from "../data/SlideData";

export default function MainPage() {
  const [isHeroVideoPlaying, setIsHeroVideoPlaying] = useState(true);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("home-scroll-snap");

    return () => root.classList.remove("home-scroll-snap");
  }, []);

  return (
    <main id="main-content" className="home">
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
      </section>
      <section className="gallery-section" aria-labelledby="gallery-title">
        <div className="section-heading">
          <h2 id="gallery-title">Explore Fireworks Play</h2>
          <p>Fireworks, maps, and multiplayer.</p>
        </div>
        <ImageSlider slides={SlideData} />
      </section>
    </main>
  );
}
