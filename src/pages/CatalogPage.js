import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import catalog from "../data/gameCatalog.json";

const pageSize = 25;
const fireworkCategories = [...new Set(catalog.filter((item) => item.category !== "Racks").map((item) => item.category))];

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
          {["All", ...fireworkCategories].map((name) => (
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

export default function CatalogPage({ racks = false }) {
  const [params, setParams] = useSearchParams();
  const selected = params.get("category") || "All";
  const category = fireworkCategories.includes(selected) ? selected : "All";
  const matches = catalog.filter((item) =>
    (racks ? item.category === "Racks" : item.category !== "Racks") &&
    (racks || category === "All" || item.category === category)
  );
  // Shells in the game includes effects also listed in specialized categories.
  const items = [...new Map(matches.map((item) => [item.id, item])).values()];
  const pages = Math.max(1, Math.ceil(items.length / pageSize));
  const page = Math.min(pages, Math.max(1, Math.floor(Number(params.get("page")) || 1)));
  const visible = items.slice((page - 1) * pageSize, page * pageSize);
  const updateFilter = (key, value) => {
    const next = new URLSearchParams(params);
    value ? next.set(key, value) : next.delete(key);
    next.delete("page");
    setParams(next, { replace: true });
  };
  const changePage = (value) => {
    const next = new URLSearchParams(params);
    next.set("page", value);
    setParams(next);
    requestAnimationFrame(() => {
      document.getElementById("catalog-results")?.scrollIntoView({ block: "start" });
    });
  };

  return (
    <main id="main-content" className="catalog-page">
      <div className="section-heading">
        <h1>{racks ? "Racks" : "Fireworks"}</h1>
        <p>{racks ? "Reloadable racks, tubes, and firing tools from Fireworks Play." : "Browse the fireworks and effects available in Fireworks Play."}</p>
      </div>
      {!racks && <div className="catalog-filters">
        <CategoryFilter
          value={category}
          onChange={(value) => updateFilter("category", value === "All" ? "" : value)}
        />
      </div>}
      <p id="catalog-results" className="catalog-count" aria-live="polite">{items.length} items</p>
      {items.length ? <div className="catalog-grid">
        {visible.map((item) => <article className="catalog-card" key={`${item.category}-${item.id}`}>
          <div className="catalog-image"><img src={item.image} alt={item.name} loading="lazy" width="256" height="256" /></div>
          <div className="catalog-card-label"><h2>{item.name}</h2></div>
        </article>)}
      </div> : <p className="catalog-empty">No items available.</p>}
      {pages > 1 && <nav className="catalog-pagination" aria-label="Catalog pages">
        <button disabled={page === 1} onClick={() => changePage(page - 1)}>Previous</button>
        <span>Page {page} of {pages}</span>
        <button disabled={page === pages} onClick={() => changePage(page + 1)}>Next</button>
      </nav>}
    </main>
  );
}
