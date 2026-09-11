import { useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { FaYoutube, FaTiktok, FaDiscord } from "react-icons/fa";
import socialMediaLinks from "../data/SocialMediaLinks";
import publicRoutes from "../data/publicRoutes.json";

const siteOrigin = "https://fireworksplay.com";
const normalizePath = (path) => path.replace(/\/+$/, "") || "/";
const publicRouteByPath = new Map();

publicRoutes.forEach((route) => {
  [route.path, ...(route.aliases || [])].forEach((path) => {
    publicRouteByPath.set(normalizePath(path), route);
  });
});

function setMetaContent(attribute, key, content) {
  let meta = document.head.querySelector("meta[" + attribute + '="' + key + '"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute(attribute, key);
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", content);
}

export default function RootLayout() {
  const { pathname } = useLocation();
  const normalizedPath = normalizePath(pathname);
  const routeMetadata = publicRouteByPath.get(normalizedPath);
  const publicPage = Boolean(routeMetadata);
  const isHomePage = routeMetadata?.path === "/";

  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);

  useEffect(() => {
    const canonical = document.head.querySelector('link[rel="canonical"]');
    const structuredData = document.getElementById("route-structured-data");

    if (!routeMetadata) {
      setMetaContent("name", "robots", "noindex, nofollow");
      canonical?.remove();
      structuredData?.remove();
      return;
    }

    const canonicalUrl = new URL(routeMetadata.path, siteOrigin).href;
    document.title = routeMetadata.title;
    setMetaContent("name", "title", routeMetadata.title);
    setMetaContent("name", "description", routeMetadata.description);
    setMetaContent("name", "robots", "index, follow");
    setMetaContent("property", "og:url", canonicalUrl);
    setMetaContent("property", "og:title", routeMetadata.title);
    setMetaContent("property", "og:description", routeMetadata.description);
    setMetaContent("name", "twitter:url", canonicalUrl);
    setMetaContent("name", "twitter:title", routeMetadata.title);
    setMetaContent("name", "twitter:description", routeMetadata.description);

    const canonicalLink = canonical || document.createElement("link");
    canonicalLink.setAttribute("rel", "canonical");
    canonicalLink.setAttribute("href", canonicalUrl);
    if (!canonical) document.head.appendChild(canonicalLink);

    const schema = structuredData || document.createElement("script");
    schema.setAttribute("type", "application/ld+json");
    schema.setAttribute("id", "route-structured-data");
    schema.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": routeMetadata.path === "/" ? "WebSite" : "WebPage",
      name: routeMetadata.heading,
      description: routeMetadata.description,
      url: canonicalUrl,
    });
    if (!structuredData) document.head.appendChild(schema);
  }, [routeMetadata]);

  if (!publicPage) return <Outlet />;
  return (
    <div className="site-shell">
      <a className="skip-link" href="#main-content">Skip to content</a>
      {!isHomePage && (
        <nav className="subpage-nav" aria-label="Page navigation">
          <Link className="back-home-link" to="/">← Back to Fireworks Play</Link>
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
