"use client";

import { useEffect, useState, type PointerEvent as ReactPointerEvent } from "react";

type Anchor = "right" | "left";

interface TargetConfig {
  key: string;
  label: string;
  selector: string;
  anchor: Anchor;
  color: string;
}

const TARGETS: TargetConfig[] = [
  { key: "radio", label: "📻 radio", selector: "#radio-wrapper", anchor: "right", color: "#00ff66" },
  { key: "footer", label: "🦶 footer", selector: ".site-footer", anchor: "left", color: "#ff66cc" }
];

type Box = { top: number; right: number; left: number; width: number; height: number };

const PANEL_POS_KEY = "radioDebugPanelPos";

export function RadioPositionDebugger() {
  const [enabled, setEnabled] = useState(false);
  const [boxes, setBoxes] = useState<Record<string, Box>>({});
  const [viewport, setViewport] = useState({ w: 0, h: 0 });
  const [panelPos, setPanelPos] = useState<{ top: number; left: number }>({ top: 16, left: 16 });
  const [collapsed, setCollapsed] = useState(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setEnabled(new URLSearchParams(window.location.search).has("debug"));
    try {
      const raw = localStorage.getItem(PANEL_POS_KEY);
      if (raw) setPanelPos(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    if (!dragOffset) return;
    const onMove = (e: PointerEvent) => {
      setPanelPos({ top: e.clientY - dragOffset.y, left: e.clientX - dragOffset.x });
    };
    const onUp = () => {
      setDragOffset(null);
      try {
        localStorage.setItem(PANEL_POS_KEY, JSON.stringify(panelPos));
      } catch {}
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [dragOffset, panelPos]);

  useEffect(() => {
    if (!enabled) return;

    const cleanups: Array<() => void> = [];
    const elementsByKey: Record<string, HTMLElement> = {};

    const readAll = () => {
      const next: Record<string, Box> = {};
      for (const t of TARGETS) {
        const el = elementsByKey[t.key];
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        const op = (el.offsetParent as HTMLElement | null) ?? document.body;
        const pr = op.getBoundingClientRect();
        next[t.key] = {
          top: Math.round(rect.top - pr.top),
          right: Math.round(pr.right - rect.right),
          left: Math.round(rect.left - pr.left),
          width: Math.round(rect.width),
          height: Math.round(rect.height)
        };
      }
      setBoxes(next);
      setViewport({ w: window.innerWidth, h: window.innerHeight });
    };

    const wireUp = (target: TargetConfig) => {
      const el = document.querySelector<HTMLElement>(target.selector);
      if (!el) return;
      elementsByKey[target.key] = el;

      // Si l'élément n'est pas déjà en position: absolute, on bake sa position
      // courante en inline pour pouvoir le déplacer librement sans casser le flow.
      const computed = getComputedStyle(el);
      const wasAlreadyAbsolute = computed.position === "absolute";
      let bakedInline: Partial<CSSStyleDeclaration> = {};
      if (!wasAlreadyAbsolute) {
        const rect = el.getBoundingClientRect();
        const op = (el.offsetParent as HTMLElement | null) ?? document.body;
        const pr = op.getBoundingClientRect();
        bakedInline = {
          position: el.style.position,
          top: el.style.top,
          left: el.style.left,
          width: el.style.width
        };
        el.style.position = "absolute";
        el.style.top = `${Math.round(rect.top - pr.top)}px`;
        el.style.left = `${Math.round(rect.left - pr.left)}px`;
        el.style.width = `${Math.round(rect.width)}px`;
      }

      // Désactive les pointer-events des enfants
      const prevChildren: Array<[HTMLElement, string]> = [];
      Array.from(el.children).forEach((c) => {
        if (c instanceof HTMLElement) {
          prevChildren.push([c, c.style.pointerEvents]);
          c.style.pointerEvents = "none";
        }
      });

      const prevOutline = el.style.outline;
      const prevCursor = el.style.cursor;
      el.style.outline = `2px dashed ${target.color}`;
      el.style.outlineOffset = "2px";
      el.style.cursor = "grab";

      // Poignée de redimensionnement
      const handle = document.createElement("div");
      handle.style.cssText = [
        "position: absolute",
        "right: -8px",
        "bottom: -8px",
        `background: ${target.color}`,
        "width: 18px",
        "height: 18px",
        "border: 2px solid #000",
        "cursor: nwse-resize",
        "z-index: 99999",
        "pointer-events: auto",
        "border-radius: 3px"
      ].join(";");
      el.appendChild(handle);

      let mode: "idle" | "drag" | "resize" = "idle";
      let start = { x: 0, y: 0, top: 0, anchorVal: 0, width: 0 };

      const parseNum = (v: string, f: number) => {
        const n = parseFloat(v);
        return Number.isFinite(n) ? n : f;
      };

      const onPointerDown = (e: PointerEvent) => {
        const rect = el.getBoundingClientRect();
        const op = (el.offsetParent as HTMLElement | null) ?? document.body;
        const pr = op.getBoundingClientRect();
        start = {
          x: e.clientX,
          y: e.clientY,
          top: parseNum(el.style.top, rect.top - pr.top),
          anchorVal:
            target.anchor === "right"
              ? parseNum(el.style.right, pr.right - rect.right)
              : parseNum(el.style.left, rect.left - pr.left),
          width: parseNum(el.style.width, rect.width)
        };
        mode = e.target === handle ? "resize" : "drag";
        el.style.cursor = mode === "resize" ? "nwse-resize" : "grabbing";
        (e.target as Element).setPointerCapture?.(e.pointerId);
        e.preventDefault();
      };

      const onPointerMove = (e: PointerEvent) => {
        if (mode === "idle") return;
        const dx = e.clientX - start.x;
        const dy = e.clientY - start.y;
        if (mode === "drag") {
          el.style.top = `${Math.round(start.top + dy)}px`;
          if (target.anchor === "right") {
            el.style.right = `${Math.round(start.anchorVal - dx)}px`;
            el.style.left = "";
          } else {
            el.style.left = `${Math.round(start.anchorVal + dx)}px`;
            el.style.right = "";
          }
        } else {
          el.style.width = `${Math.max(100, Math.round(start.width + dx))}px`;
        }
        readAll();
      };

      const onPointerUp = () => {
        if (mode !== "idle") {
          mode = "idle";
          el.style.cursor = "grab";
        }
      };

      el.addEventListener("pointerdown", onPointerDown);
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);

      cleanups.push(() => {
        el.removeEventListener("pointerdown", onPointerDown);
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
        handle.remove();
        el.style.outline = prevOutline;
        el.style.outlineOffset = "";
        el.style.cursor = prevCursor;
        prevChildren.forEach(([c, v]) => (c.style.pointerEvents = v));
        if (!wasAlreadyAbsolute) {
          el.style.position = bakedInline.position ?? "";
          el.style.top = bakedInline.top ?? "";
          el.style.left = bakedInline.left ?? "";
          el.style.width = bakedInline.width ?? "";
        }
      });
    };

    TARGETS.forEach(wireUp);
    readAll();

    const onResize = () => readAll();
    window.addEventListener("resize", onResize);
    cleanups.push(() => window.removeEventListener("resize", onResize));

    return () => cleanups.forEach((c) => c());
  }, [enabled]);

  if (!enabled) return null;

  const onHeaderPointerDown = (e: ReactPointerEvent) => {
    setDragOffset({ x: e.clientX - panelPos.left, y: e.clientY - panelPos.top });
    e.preventDefault();
  };

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        top: panelPos.top,
        left: panelPos.left,
        zIndex: 99999,
        background: "rgba(0, 0, 0, 0.92)",
        color: "#fff",
        borderRadius: 10,
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        fontSize: 12,
        lineHeight: 1.55,
        boxShadow: "0 4px 20px rgba(0,0,0,0.55)",
        minWidth: collapsed ? 0 : 280,
        maxWidth: 320,
        userSelect: "text",
        overflow: "hidden"
      }}
    >
      {/* Bandeau titre — draggable, cursor move */}
      <div
        onPointerDown={onHeaderPointerDown}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          padding: "8px 12px",
          background: "rgba(255,255,255,0.08)",
          cursor: "move",
          touchAction: "none",
          fontSize: 11,
          fontWeight: 700,
          opacity: 0.9
        }}
      >
        <span>📐 DEBUG — glisse-moi</span>
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => setCollapsed((c) => !c)}
          style={{
            background: "transparent",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.3)",
            borderRadius: 4,
            padding: "1px 8px",
            cursor: "pointer",
            fontSize: 11,
            fontFamily: "inherit"
          }}
          title={collapsed ? "Déplier" : "Replier"}
        >
          {collapsed ? "▢" : "—"}
        </button>
      </div>

      {!collapsed && (
        <div style={{ padding: "10px 14px 14px", pointerEvents: "none" }}>
          <div style={{ marginBottom: 8, fontSize: 11, opacity: 0.7 }}>
            viewport <b style={{ color: "#fff" }}>{viewport.w}×{viewport.h}</b>
          </div>
          {TARGETS.map((t) => {
        const b = boxes[t.key];
        if (!b) {
          return (
            <div key={t.key} style={{ marginTop: 8, opacity: 0.5 }}>
              {t.label} : <i>introuvable</i>
            </div>
          );
        }
        const css =
          t.anchor === "right"
            ? `top: ${b.top}px;\nright: ${b.right}px;\nwidth: ${b.width}px;`
            : `top: ${b.top}px;\nleft: ${b.left}px;\nwidth: ${b.width}px;`;
        return (
          <div key={t.key} style={{ marginTop: 10, paddingTop: 8, borderTop: `1px solid ${t.color}33` }}>
            <div style={{ color: t.color, fontWeight: 700, marginBottom: 4 }}>{t.label}</div>
            <div>top : <b>{b.top}px</b></div>
            <div>{t.anchor === "right" ? "right" : "left"} : <b>{t.anchor === "right" ? b.right : b.left}px</b></div>
            <div>W×H : <b>{b.width}×{b.height}</b></div>
            <pre style={{ margin: "4px 0 0", color: t.color, fontSize: 11 }}>{css}</pre>
          </div>
        );
      })}
        </div>
      )}
    </div>
  );
}
