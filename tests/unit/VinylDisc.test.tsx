import { describe, it, expect } from "vitest";
import React from "react";
import { render } from "@testing-library/react";
import { VinylDisc } from "@/components/VinylDisc";

describe("VinylDisc", () => {
  it("renders an svg with the cover url inside an image element", () => {
    const { container } = render(<VinylDisc coverUrl="/img/test-cover.jpg" size={120} />);
    const svg = container.querySelector("svg");
    expect(svg).toBeTruthy();
    const image = container.querySelector("image");
    expect(image?.getAttribute("href")).toBe("/img/test-cover.jpg");
  });

  it("uses given size for both width and height", () => {
    const { container } = render(<VinylDisc coverUrl="/x.jpg" size={200} />);
    const svg = container.querySelector("svg")!;
    expect(svg.getAttribute("width")).toBe("200");
    expect(svg.getAttribute("height")).toBe("200");
  });
});
