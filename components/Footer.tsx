"use client";

export function Footer() {
  return (
    <footer
      id="site-credits"
      className="hidden lg:block"
      style={{
        background: "transparent",
        textAlign: "center",
        padding: "12px 16px",
        fontSize: "15px",
        color: "#ffffff"
      }}
    >
      <a
        id="footer-link-pastini"
        href="https://www.mariepierrepastini.fr/"
        rel="external noreferrer"
        target="_blank"
        style={{ color: "#fff", textDecoration: "none" }}
        onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
        onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
      >
        Webdesign MP Pastini
      </a>{" "}
      — <span id="footer-credit-cefi">Développement Cef-i</span> —{" "}
      <span id="footer-copyright">Radio Choup, tous droits réservés</span>
    </footer>
  );
}
