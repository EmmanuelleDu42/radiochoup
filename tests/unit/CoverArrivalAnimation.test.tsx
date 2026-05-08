import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/react";
import { CoverArrivalAnimation } from "@/components/CoverArrivalAnimation";
import { CoverAnimationProvider } from "@/lib/cover-animation-context";
import type { CoverArt } from "@/lib/types";

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
    expect(queryByTestId("cover-arrival-overlay")).not.toBeNull();
  });
});
