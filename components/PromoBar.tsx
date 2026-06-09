import Image from "next/image";

export function PromoBar() {
  return (
    <footer className="site-footer hidden lg:block">
      <div className="footer-widgets">
        <a className="footer-card" href="#">
          <div className="footer-card__image">
            <Image
              src="/img/appstore.jpg"
              alt="Application Radio Choup bientôt disponible"
              width={300}
              height={200}
              className="ftc-img"
            />
          </div>
          <div className="footer-card__content">
            <span className="footer-card__label">Bientôt disponible</span>
            <strong>Radio Choup sur mobile</strong>
          </div>
        </a>

        <a className="footer-card footer-card--don" href="#">
          <div className="footer-card__image">
            <Image
              src="/img/radio_ancienne_footer.webp"
              alt="Faire un don à Radio Choup"
              width={300}
              height={200}
              className="ftc-img"
            />
          </div>
          <div className="footer-card__content">
            <span>Vous aimez écouter Radio Choup</span>
            <strong>Faites un don</strong>
          </div>
        </a>

        <a
          className="footer-card footer-card--full"
          href="https://www.deguizland.com/catalogsearch/result/?q=ann%C3%A9e+50"
          target="_blank"
          rel="external noreferrer"
        >
          <div className="footer-card__image">
            <Image
              src="/img/pub_polkamatik.png"
              alt="Déguisement années 50 60 - Cliquez ici"
              width={400}
              height={200}
              className="ftc-img"
            />
          </div>
        </a>
      </div>

      <div className="footer-credits">
        <a
          href="https://www.mariepierrepastini.fr/"
          rel="external noreferrer"
          target="_blank"
          className="footer-credits__link"
        >
          Webdesign MP Pastini
        </a>
        , Développement Cef-i, Radio Choup, tous droits réservés
      </div>
    </footer>
  );
}
