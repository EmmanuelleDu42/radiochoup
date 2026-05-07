"use client";

export function Footer() {
  return (
    <footer
      style={{
        background: "url('/img/background_footer.png') repeat",
        textAlign: "center",
        padding: "12px 16px",
        fontSize: "15px",
        color: "#ffffff"
      }}
    >
      <a
        href="https://www.mariepierrepastini.fr/"
        rel="external noreferrer"
        target="_blank"
        style={{ color: "#fff", textDecoration: "none" }}
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
