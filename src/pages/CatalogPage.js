import { useSearchParams } from "react-router-dom";
import catalog from "../data/gameCatalog.json";

const pageSize = 24;
const fireworkCategories = [...new Set(catalog.filter((item) => item.category !== "Racks").map((item) => item.category))];

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
        <label>Category
          <select value={category} onChange={(event) => updateFilter("category", event.target.value)}>
            <option value="All">All categories</option>
            {fireworkCategories.map((name) => <option key={name}>{name}</option>)}
          </select>
        </label>
      </div>}
      <p id="catalog-results" className="catalog-count" aria-live="polite">{items.length} items</p>
      {items.length ? <div className="catalog-grid">
        {visible.map((item) => <article className="catalog-card" key={`${item.category}-${item.id}`}>
          <div className="catalog-image"><img src={item.image} alt={item.name} loading="lazy" width="256" height="256" /></div>
          <div className="catalog-card-label"><p>{item.category}</p><h2>{item.name}</h2></div>
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
