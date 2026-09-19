import { Link } from "react-router-dom";

export default function FeatureCard({ feature, reverse = false }) {
  const images = feature.images?.length ? feature.images : [feature.image];
  const fadeCount = [2, 3, 4, 5, 6].includes(images.length) ? images.length : 0;
  const visibleImages = fadeCount ? images : images.slice(0, 1);

  return (
    <article
      className={`new-game-card feature-card${reverse ? " feature-card--reverse" : ""}${feature.dim ? " feature-card--dim" : ""}${fadeCount ? ` feature-card--fade-${fadeCount}` : ""}`}
    >
      {visibleImages.map((src, index) => (
        <img
          key={src}
          className={`new-game-hero-image${fadeCount ? " new-game-hero-image--fade" : ""}`}
          src={src}
          alt={index === 0 ? feature.alt || "" : ""}
          aria-hidden={index > 0 ? "true" : undefined}
          width="1200"
          height="600"
          loading="lazy"
          decoding="async"
          style={feature.objectPosition ? { objectPosition: feature.objectPosition } : undefined}
        />
      ))}
      <div className="new-game-content">
        <h3 className="feature-title">{feature.title}</h3>
        <p>{feature.description}</p>
        {feature.links?.length > 0 && (
          <div className="new-game-links">
            {feature.links.map((link) =>
              link.to ? (
                <Link key={link.label} className="text-link feature-link" to={link.to}>
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.label}
                  className="text-link feature-link"
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.label}
                </a>
              )
            )}
          </div>
        )}
      </div>
    </article>
  );
}
