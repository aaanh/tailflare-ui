import Image from "next/image";

export default function Header() {
  return (
    <div className="flex items-center gap-2 shadow p-2 border-b">
      <Image
        src="/aaanh.webp"
        width={32}
        height={32}
        alt="logo"
        className="rotate-45"
      />
      <div className="relative">
        <h1 className="z-50 font-bold text-2xl">Tailflare</h1>
        <span className="top-2.5 -left-1 -z-10 absolute bg-yellow-500/80 skew-x-6 w-[8.5rem] h-4 -rotate-2"></span>
      </div>
      <div className="p-2 border-black border-l-2">
        <p>Sync Tailscale hosts to Cloudflare DNS</p>
      </div>
    </div>
  );
}
