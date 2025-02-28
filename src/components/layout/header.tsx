import { useTailflare } from "@/contexts/tailflare-context";
import Image from "next/image";
import KeyEntryDialog from "../key-entry-dialog";
import { ModeToggle } from "../theme-toggle";

export default function Header() {
  return (
    <div className="flex flex-wrap justify-between items-center gap-4 dark:bg-foreground/5 shadow p-2 border rounded-md">
      <div className="flex items-center gap-2">
        <Image
          src="/aaanh.webp"
          width={32}
          height={32}
          alt="logo"
          className="animate-spin"
        />
        <div className="relative">
          <h1 className="z-50 font-bold text-affirmative text-lg lg:text-2xl">
            Tailflare
          </h1>
          {/* <span className="top-2.5 -left-1 -z-10 absolute bg-green-500/80 w-28 lg:w-32 h-4 -rotate-2 skew-x-6"></span> */}
        </div>
        <div className="hidden lg:block p-2 border-neutral-500 border-l-2 text-sm">
          <span>Sync Tailscale hosts to Cloudflare DNS</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <ModeToggle />
        <KeyEntryDialog />
      </div>
    </div>
  );
}
