import Image from "next/image";

export default function Header() {
  return (
    <div className="flex items-center gap-2 shadow p-2 border-b">
      <Image
        src="/aaanh.webp"
        width={32}
        height={32}
        alt="logo"
        className="animate-spin"
      />
      <div className="relative">
        <h1 className="z-50 font-bold text-2xl">Tailflare</h1>
        <span className="top-2.5 -left-1 -z-10 absolute bg-yellow-500/80 skew-x-6 w-32 h-4 -rotate-2"></span>
      </div>
      <div className="border-neutral-500 p-2 border-l-2">
        <span>Sync Tailscale hosts to Cloudflare DNS</span>
      </div>
    </div>
  );
}
