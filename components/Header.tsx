import Image from "next/image";
import Link from "next/link";

export function Header() {
  return (
    <header className="grid grid-cols-12 items-center border-b border-choup-pink-300/40 bg-[url('/img/background_menu.png')] bg-repeat px-4 py-6 md:px-8">
      <div className="col-span-3">
        <Link href="/" title="Radio Choup">
          <Image src="/img/logo.png" alt="Radio Choup" width={200} height={100} priority />
        </Link>
      </div>
      <div className="col-span-9" id="cover-slot" />
    </header>
  );
}
