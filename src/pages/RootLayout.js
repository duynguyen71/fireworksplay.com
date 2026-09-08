import { useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { FaYoutube, FaTiktok, FaDiscord } from "react-icons/fa";
import socialMediaLinks from "../data/SocialMediaLinks";

export default function RootLayout() {
  const { pathname } = useLocation();
  const normalizedPath = pathname.replace(/\/$/, "") || "/";
  const publicPage = ["/", "/fireworksplay", "/release-note", "/fireworksplay/release-note", "/fireworks", "/racks", "/fireworksplay/fireworks", "/fireworksplay/racks"].includes(normalizedPath);
  const homePath = normalizedPath.startsWith("/fireworksplay/") ? "/fireworksplay" : "/";
  const isHomePage = normalizedPath === "/" || normalizedPath === "/fireworksplay";
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  if (!publicPage) return <Outlet />;
  return (
    <div className="site-shell">
      <a className="skip-link" href="#main-content">Skip to content</a>
      {!isHomePage && (
        <nav className="subpage-nav" aria-label="Page navigation">
          <Link className="back-home-link" to={homePath}>← Back to Fireworks Play</Link>
        </nav>
      )}
      <Outlet />
      <footer className="site-footer">
        <nav className="footer-links" aria-label="Community">
          <a href={socialMediaLinks.youtube} aria-label="YouTube" target="_blank" rel="noopener noreferrer"><FaYoutube aria-hidden="true" /></a>
          <a href={socialMediaLinks.tiktok} aria-label="TikTok" target="_blank" rel="noopener noreferrer"><FaTiktok aria-hidden="true" /></a>
          <a href={socialMediaLinks.discord} aria-label="Discord" target="_blank" rel="noopener noreferrer"><FaDiscord aria-hidden="true" /></a>
        </nav>
        <p>
          <span className="footer-copy">© {new Date().getFullYear()} <span className="studio-word"><span className="studio-sim">Sim</span>play Studio</span></span>
          <span className="footer-meta">
            <a href="/privacy.html">Privacy</a>
            <span aria-hidden="true">|</span>
            <a href="mailto:contact@simplaystudio.com">contact@simplaystudio.com</a>
          </span>
        </p>
      </footer>
    </div>
  );
}
