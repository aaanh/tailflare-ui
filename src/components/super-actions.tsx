import { useTailflare } from "@/contexts/tailflare-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  BoxesIcon,
  CloudLightningIcon,
  ListCheckIcon,
  Trash2Icon,
  ZapIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./ui/button";

export default function SuperActionsMenu() {
  const { information, tailflareState } = useTailflare();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <span
          className={cn(buttonVariants({ variant: "default", size: "icon" }))}
        >
          <ZapIcon />
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 font-sans">
        <DropdownMenuItem disabled>
          <ListCheckIcon />
          Add all hosts
        </DropdownMenuItem>
        <DropdownMenuItem disabled>
          <BoxesIcon /> Change all added subdomains
        </DropdownMenuItem>
        <DropdownMenuItem className="text-red-500" disabled>
          <Trash2Icon /> Remove all hosts from Cloudflare
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
