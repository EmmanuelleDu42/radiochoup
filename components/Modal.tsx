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
  children: ReactNode;
}

export function Modal({ open, onClose, title, titleId, maxWidthClass = "max-w-xl", children }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4"
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className={`max-h-[80vh] w-full ${maxWidthClass} overflow-y-auto p-6 shadow-2xl`}
            style={{
              backgroundColor: "rgba(0,0,0,0.85)",
              borderRadius: 0,
              color: "#fff"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <header
              style={{
                marginBottom: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}
            >
              <h2
                id={titleId}
                style={{
                  fontSize: "20px",
                  fontWeight: "bold",
                  color: "#ef929d",
                  margin: 0,
                  fontFamily: '"Trebuchet MS", Arial, sans-serif'
                }}
              >
                {title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Fermer"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#ef929d",
                  padding: "4px",
                  borderRadius: 0,
                  transition: "opacity 0.2s"
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                <X size={20} />
              </button>
            </header>
            {children}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
