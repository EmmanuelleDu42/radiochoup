"use client";

import { useEffect, useState } from "react";

export function useTargetRect(selector: string): DOMRect | null {
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    function update() {
      const el = document.querySelector(selector);
      setRect(el ? el.getBoundingClientRect() : null);
    }
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [selector]);

  return rect;
}
