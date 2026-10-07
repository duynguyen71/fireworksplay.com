/* eslint-disable testing-library/no-node-access -- Canonical metadata lives in document.head, outside Testing Library's accessible queries. */
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import CatalogPage from "./CatalogPage";
import RootLayout from "./RootLayout";
import { getCatalogItems, pageSize } from "../utils/catalogRoutes";

function renderCatalog(url = "/fireworks/") {
  return render(<MemoryRouter initialEntries={[url]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <Routes><Route element={<RootLayout />}>
      <Route path="/fireworks/" element={<CatalogPage />} />
      <Route path="/fireworks/page/:pageNumber/" element={<CatalogPage />} />
    </Route></Routes>
  </MemoryRouter>);
}

beforeEach(() => {
  window.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} };
  window.scrollTo = jest.fn();
  window.HTMLElement.prototype.scrollIntoView = jest.fn();
});

test("uses crawlable page links and updates the canonical after navigation", async () => {
  renderCatalog();
  expect(screen.getByRole("link", { name: "Next" })).toHaveAttribute("href", "/fireworks/page/2/");
  expect(screen.getByRole("link", { name: "Racks catalog" })).toHaveAttribute("href", "/racks/");
  fireEvent.click(screen.getByRole("link", { name: "Next" }));
  expect(screen.getByRole("heading", { name: getCatalogItems()[pageSize].name })).toBeInTheDocument();
  await waitFor(() => expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute("href", "https://fireworksplay.com/fireworks/page/2/"));
  expect(document.title).toContain("Page 2");
  expect(screen.getByRole("link", { name: "Previous" })).toHaveAttribute("href", "/fireworks/");
});

test("keeps legacy query pagination compatible and canonicalizes to the new route", () => {
  renderCatalog("/fireworks/?page=2");
  expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute("href", "https://fireworksplay.com/fireworks/page/2/");
  expect(screen.getByRole("heading", { name: getCatalogItems()[pageSize].name })).toBeInTheDocument();
});

test("changing category on a paginated route resets to page one", () => {
  renderCatalog("/fireworks/page/2/");
  fireEvent.click(screen.getByRole("button", { name: "Cakes" }));
  expect(screen.getByText(/^Page 1 of/)).toBeInTheDocument();
  expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute("href", "https://fireworksplay.com/fireworks/");
  expect(screen.getByRole("heading", { name: getCatalogItems(false, "Cakes")[0].name })).toBeInTheDocument();
});
