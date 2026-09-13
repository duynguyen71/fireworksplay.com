import fs from "fs";
import path from "path";
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import MainPage from "./MainPage";

const videoTitle = "Fireworks Play trailer background";

function renderMainPage(width) {
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    value: width,
  });

  return render(
    <MemoryRouter>
      <MainPage />
    </MemoryRouter>
  );
}

beforeEach(() => {
  window.IntersectionObserver = class IntersectionObserver {
    observe() {}

    unobserve() {}

    disconnect() {}
  };

  window.matchMedia = jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    addListener: jest.fn(),
    removeListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }));
});

test.each([390, 1440])("keeps the autoplaying hero video at %ipx", async (width) => {
  renderMainPage(width);

  const iframe = await screen.findByTitle(videoTitle);
  const url = new URL(iframe.getAttribute("src"));

  expect(url.hostname).toBe("www.youtube-nocookie.com");
  expect(url.searchParams.get("autoplay")).toBe("1");
  expect(url.searchParams.get("mute")).toBe("1");
  expect(url.searchParams.get("loop")).toBe("1");
  expect(iframe).toHaveAttribute("allow", expect.stringContaining("autoplay"));

  fireEvent.load(iframe);
  expect(iframe).toHaveClass("is-ready");
});

test("uses native scrolling and jumps directly to the spotlight", () => {
  renderMainPage(1440);

  const target = screen.getByRole("region", { name: "Fireworks Show Simulator" });
  target.scrollIntoView = jest.fn();

  fireEvent.click(screen.getByRole("button", { name: "Scroll down" }));

  expect(target.scrollIntoView).toHaveBeenCalledWith({ block: "start" });

  const css = fs.readFileSync(path.resolve(__dirname, "../index.css"), "utf8");
  const source = fs.readFileSync(path.resolve(__dirname, "MainPage.js"), "utf8");

  expect(css).not.toMatch(/scroll-snap-type\s*:/);
  expect(css).not.toMatch(/scroll-behavior\s*:\s*smooth/);
  expect(source).not.toMatch(/addEventListener\(["']wheel["']/);
  expect(source).not.toMatch(/preventDefault\(\)/);
});
