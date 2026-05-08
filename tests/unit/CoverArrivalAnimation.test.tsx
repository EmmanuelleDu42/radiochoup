import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, act } from "@testing-library/react";
import { CoverArrivalAnimation } from "@/components/CoverArrivalAnimation";
import { CoverAnimationProvider } from "@/lib/cover-animation-context";
import type { CoverArt } from "@/lib/types";

// Mock framer-motion so that onAnimationComplete fires after a short timeout.
// This lets us assert the overlay is visible before the animation "ends",
// and assert it is gone after advancing timers.
vi.mock("framer-motion", () => {
  const React = require("react");
  return {
    motion: new Proxy(
      {},
      {
        get: () =>
          (props: any) => {
            const { onAnimationComplete, children, ...rest } = props;
            React.useEffect(() => {
              const id = setTimeout(() => {
                onAnimationComplete?.();
              }, 100);
              return () => clearTimeout(id);
            }, []);
            return React.createElement("div", rest, children);
          }
      }
    )
  };
});

const cover = (url: string): CoverArt => ({
  url,
  source: "itunes",
  sizes: { s96: url, s128: url, s192: url, s256: url, s384: url, s512: url }
});

describe("CoverArrivalAnimation", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    document.body.innerHTML =
      '<div id="header-cover-art" style="position:fixed;top:60px;right:20px;width:73px;height:73px;"></div>' +
      '<div id="radio-frame-bg" style="position:fixed;top:300px;left:50%;width:673px;height:475px;"></div>';
  });
  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = "";
  });

  it("does not render any animated cover on first mount", () => {
    const { queryByTestId } = render(
      <CoverAnimationProvider>
        <CoverArrivalAnimation cover={cover("/a.jpg")} />
      </CoverAnimationProvider>
    );
    expect(queryByTestId("cover-arrival-overlay")).toBeNull();
  });

  it("renders the animated cover when cover.url changes", () => {
    const { rerender, queryByTestId } = render(
      <CoverAnimationProvider>
        <CoverArrivalAnimation cover={cover("/a.jpg")} />
      </CoverAnimationProvider>
    );
    rerender(
      <CoverAnimationProvider>
        <CoverArrivalAnimation cover={cover("/b.jpg")} />
      </CoverAnimationProvider>
    );
    // Overlay is visible before the 100ms mock timeout fires
    expect(queryByTestId("cover-arrival-overlay")).not.toBeNull();
  });

  it("clears the overlay after the cover animation completes", async () => {
    const { rerender, queryByTestId } = render(
      <CoverAnimationProvider>
        <CoverArrivalAnimation cover={cover("/a.jpg")} />
      </CoverAnimationProvider>
    );
    rerender(
      <CoverAnimationProvider>
        <CoverArrivalAnimation cover={cover("/b.jpg")} />
      </CoverAnimationProvider>
    );
    // Overlay is visible before animation ends
    expect(queryByTestId("cover-arrival-overlay")).not.toBeNull();
    // Advance past the 100ms mock timeout → onAnimationComplete fires → setActiveUrl(null)
    await act(async () => {
      vi.advanceTimersByTime(200);
    });
    expect(queryByTestId("cover-arrival-overlay")).toBeNull();
  });
});
