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
      <nav className="col-span-6">
        <ul className="flex gap-6 text-choup-pink-300">
          <li>
            <a href="#about" className="border-y-2 border-dotted border-choup-pink-300 px-2 py-1 text-base">
              Qui sommes nous
            </a>
          </li>
          <li>
            <a href="#suggestion" className="border-y-2 border-dotted border-choup-pink-300 px-2 py-1 text-base">
              Suggestion
            </a>
          </li>
          <li>
            <a href="#don" className="border-y-2 border-dotted border-choup-pink-300 px-2 py-1 text-base">
              Faites un don
            </a>
          </li>
        </ul>
      </nav>
      <div className="col-span-3" id="cover-slot" />
    </header>
  );
}
