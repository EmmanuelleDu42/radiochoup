import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useTargetRect } from "@/hooks/useTargetRect";

describe("useTargetRect", () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="target" style="position:fixed;top:10px;left:20px;width:100px;height:50px;"></div>';
    vi.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue({
      x: 20, y: 10, width: 100, height: 50, top: 10, left: 20, right: 120, bottom: 60, toJSON: () => ({})
    } as DOMRect);
  });
  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = "";
  });

  it("returns the rect of the element matching the selector", () => {
    const { result } = renderHook(() => useTargetRect("#target"));
    expect(result.current).toMatchObject({ top: 10, left: 20, width: 100, height: 50 });
  });

  it("returns null when the selector matches nothing", () => {
    const { result } = renderHook(() => useTargetRect("#missing"));
    expect(result.current).toBeNull();
  });
});
