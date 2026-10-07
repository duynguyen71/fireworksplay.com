import { useEffect, useRef } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import LazyImage from "../components/LazyImage";
import { pageSize, categoryOptions, getCatalogItems, catalogPagePath } from "../utils/catalogRoutes";

function CategoryFilter({ value, onChange }) {
  const detailsRef = useRef(null);
  const label = value === "All" ? "All categories" : value;

  useEffect(() => {
    const closeOnPointerDown = (event) => {
      const details = detailsRef.current;
      if (details?.open && !details.contains(event.target)) details.open = false;
    };
    const closeOnEscape = (event) => {
      const details = detailsRef.current;
      if (event.key !== "Escape" || !details?.open) return;
      details.open = false;
      details.querySelector("summary")?.focus();
    };

    document.addEventListener("pointerdown", closeOnPointerDown);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnPointerDown);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  const selectCategory = (nextValue) => {
    onChange(nextValue);
    detailsRef.current.open = false;
    detailsRef.current.querySelector("summary")?.focus();
  };

  return (
    <div className="catalog-category-field">
      <span id="catalog-category-label" className="catalog-category-label">Category</span>
      <details ref={detailsRef} className="catalog-category-picker">
        <summary aria-labelledby="catalog-category-label catalog-category-value">
          <span id="catalog-category-value">{label}</span>
        </summary>
        <div className="catalog-category-options" role="group" aria-labelledby="catalog-category-label">
          {["All", ...categoryOptions].map((name) => (
            <button
              key={name}
              type="button"
              aria-pressed={value === name}
              onClick={() => selectCategory(name)}
            >
              {name === "All" ? "All categories" : name}
            </button>
          ))}
        </div>
      </details>
    </div>
  );
}

export default function CatalogPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { pageNumber } = useParams();
  const selected = params.get("category") || "All";
  const category = categoryOptions.includes(selected) ? selected : "All";
  const items = getCatalogItems(category);
  const pages = Math.max(1, Math.ceil(items.length / pageSize));
  const page = Math.min(pages, Math.max(1, Math.floor(Number(pageNumber || params.get("page")) || 1)));
  const visible = items.slice((page - 1) * pageSize, page * pageSize);
  const updateFilter = (key, value) => {
    const next = new URLSearchParams(params);
    value ? next.set(key, value) : next.delete(key);
    next.delete("page");
    const query = next.toString();
    navigate(catalogPagePath(1) + (query ? `?${query}` : ""), { replace: true });
  };
  const pageLink = (value) => {
    const next = new URLSearchParams(params);
    if (category !== "All") {
      next.set("page", value);
      return `${catalogPagePath(1)}?${next}`;
    }
    next.delete("page");
    const query = next.toString();
    return catalogPagePath(value) + (query ? `?${query}` : "");
  };
  const scrollToResults = () => {
    requestAnimationFrame(() => {
      document.getElementById("catalog-results")?.scrollIntoView({ block: "start" });
    });
  };

  return (
    <main id="main-content" className="catalog-page">
      <div className="section-heading">
        <h1>Game Items</h1>
        <p>Browse fireworks, effects, racks, and firing tools available in Fireworks Play.</p>
      </div>
      <div className="catalog-filters">
        <CategoryFilter
          value={category}
          onChange={(value) => updateFilter("category", value === "All" ? "" : value)}
        />
      </div>
      <p id="catalog-results" className="catalog-count" aria-live="polite">{items.length} items</p>
      {items.length ? <div className="catalog-grid">
        {visible.map((item) => <article className="catalog-card" key={`${item.category}-${item.id}`}>
          <div className="catalog-image"><LazyImage src={item.image} alt={item.name} width="256" height="256" /></div>
          <div className="catalog-card-label"><h2>{item.name}</h2></div>
        </article>)}
      </div> : <p className="catalog-empty">No items available.</p>}
      {pages > 1 && <nav className="catalog-pagination" aria-label="Catalog pages">
        {page > 1 ? <Link to={pageLink(page - 1)} onClick={scrollToResults}>Previous</Link> : <span aria-disabled="true">Previous</span>}
        <span>Page {page} of {pages}</span>
        {page < pages ? <Link to={pageLink(page + 1)} onClick={scrollToResults}>Next</Link> : <span aria-disabled="true">Next</span>}
      </nav>}
    </main>
  );
}
