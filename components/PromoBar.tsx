import Image from "next/image";

export function PromoBar() {
  return (
    <div
      className="w-full"
      style={{
        background: "#fff"
      }}
    >
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-0 sm:grid-cols-3">
        {/* App Store */}
        <div className="flex items-center justify-center bg-white p-3">
          <Image
            src="/img/appstore.jpg"
            alt="Télécharger sur l'App Store"
            width={300}
            height={100}
            className="h-auto w-full max-w-[300px] object-contain"
          />
        </div>

        {/* Faites un don */}
        <div className="flex items-center justify-center bg-white p-3">
          <Image
            src="/img/FaitesUnDon.png"
            alt="Faites un don"
            width={300}
            height={100}
            className="h-auto w-full max-w-[300px] object-contain"
          />
        </div>

        {/* Polkamatik / Deguizland */}
        <div className="flex items-center justify-center bg-white p-3">
          <a
            href="https://www.deguizland.com/catalogsearch/result/?q=ann%C3%A9e+50"
            target="_blank"
            rel="external noreferrer"
            className="block transition-opacity hover:opacity-85"
          >
            <Image
              src="/img/pub_polkamatik.png"
              alt="Polkamatik - Années 50"
              width={300}
              height={100}
              className="h-auto w-full max-w-[300px] object-contain"
            />
          </a>
        </div>
      </div>
    </div>
  );
}
