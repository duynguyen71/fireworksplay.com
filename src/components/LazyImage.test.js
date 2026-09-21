import { act, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import LazyImage from "./LazyImage";

const realSource = "/images/webp/multiplayer-fireworks.webp";

let observerCallback;
let observedTargets;

beforeEach(() => {
  observerCallback = null;
  observedTargets = [];

  window.IntersectionObserver = class IntersectionObserver {
    constructor(callback) {
      observerCallback = callback;
    }

    observe(target) {
      observedTargets.push(target);
    }

    unobserve() {}

    disconnect() {}
  };
});

afterEach(() => {
  delete window.IntersectionObserver;
});

test("defers the image source until it scrolls into view", () => {
  render(<LazyImage src={realSource} alt="Fireworks Play gameplay" width="1200" height="600" />);

  const image = screen.getByAltText("Fireworks Play gameplay");

  expect(observedTargets).toContain(image);
  expect(image.getAttribute("src")).toMatch(/^data:image\/gif/);
  expect(image).toHaveAttribute("loading", "lazy");

  act(() => observerCallback([{ isIntersecting: true, target: image }]));

  expect(image).toHaveAttribute("src", realSource);
});

test("loads immediately when IntersectionObserver is unavailable", () => {
  delete window.IntersectionObserver;

  render(<LazyImage src={realSource} alt="Fireworks Play gameplay" />);

  expect(screen.getByAltText("Fireworks Play gameplay")).toHaveAttribute("src", realSource);
});

test("loads priority images immediately", () => {
  render(<LazyImage src={realSource} alt="Fireworks Play gameplay" priority />);

  const image = screen.getByAltText("Fireworks Play gameplay");

  expect(image).toHaveAttribute("src", realSource);
  expect(image).toHaveAttribute("loading", "eager");
});
