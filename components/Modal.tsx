"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { ReactNode } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  titleId: string;
  maxWidthClass?: string;
  accent?: "pink" | "turquoise" | "mauve";
  children: ReactNode;
}

const ACCENTS: Record<NonNullable<Props["accent"]>, { bar: string; title: string }> = {
  pink: { bar: "#cd7784", title: "#cd7784" },
  turquoise: { bar: "#71bfbb", title: "#71bfbb" },
  mauve: { bar: "#a992bd", title: "#a992bd" }
};

export function Modal({
  open,
  onClose,
  title,
  titleId,
  maxWidthClass = "max-w-xl",
  accent = "pink",
  children
}: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const a = ACCENTS[accent];

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 flex items-start justify-center"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.78) 100%)",
            backdropFilter: "blur(3px)",
            padding: "20px"
          }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={{ scale: 0.92, y: 24, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.94, y: 16, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.22, 0.9, 0.3, 1] }}
            className={`relative w-full ${maxWidthClass} overflow-hidden`}
            style={{
              background: "#fffaf6",
              borderRadius: "14px",
              boxShadow:
                "0 24px 60px -12px rgba(0,0,0,0.45), 0 8px 20px -8px rgba(0,0,0,0.3)",
              fontFamily: '"Trebuchet MS", Arial, Helvetica, sans-serif',
              color: "#2b2b2b",
              maxHeight: "calc(100vh - 40px)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* bandeau accent en haut */}
            <div
              style={{
                height: "6px",
                background: a.bar
              }}
            />
            <header
              style={{
                padding: "18px 28px 10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "16px"
              }}
            >
              <h2
                id={titleId}
                style={{
                  fontSize: "20px",
                  fontWeight: 700,
                  color: a.title,
                  margin: 0,
                  letterSpacing: "0.02em"
                }}
              >
                {title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Fermer"
                style={{
                  background: "transparent",
                  border: `1.5px solid ${a.bar}`,
                  borderRadius: "999px",
                  width: "32px",
                  height: "32px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: a.bar,
                  transition: "background 0.18s, color 0.18s"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = a.bar;
                  e.currentTarget.style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = a.bar;
                }}
              >
                <X size={18} />
              </button>
            </header>
            <div
              style={{
                padding: "8px 28px 24px",
                overflowY: "auto",
                maxHeight: "calc(100vh - 40px - 60px)"
              }}
            >
              {children}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
