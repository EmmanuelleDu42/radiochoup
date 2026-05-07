"use client";

export function Footer() {
  return (
    <footer
      style={{
        background: "url('/img/background_footer.png') repeat",
        textAlign: "center",
        padding: "12px 16px",
        fontSize: "11px",
        color: "#333"
      }}
    >
      <a
        href="https://www.mariepierrepastini.fr/"
        rel="external noreferrer"
        target="_blank"
        style={{ color: "#333", textDecoration: "none" }}
        onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
        onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
      >
        Webdesign MP Pastini
      </a>{" "}
      — <span>Développement Cef-i</span> —{" "}
      <span>Radio Choup, tous droits réservés</span>
    </footer>
  );
}
