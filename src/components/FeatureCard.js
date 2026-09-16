import { Link } from "react-router-dom";

export default function FeatureCard({ feature, reverse = false }) {
  return (
    <article className={`new-game-card feature-card${reverse ? " feature-card--reverse" : ""}${feature.dim ? " feature-card--dim" : ""}`}>
      <img
        className="new-game-hero-image"
        src={feature.image}
        alt={feature.alt || ""}
        width="1200"
        height="554"
        loading="lazy"
        decoding="async"
        style={feature.objectPosition ? { objectPosition: feature.objectPosition } : undefined}
      />
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
