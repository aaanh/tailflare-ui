import { useTailflare } from "@/contexts/tailflare-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { BoxesIcon, FolderPlusIcon, Trash2Icon, ZapIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./ui/button";
import { createMultipleRecordsInCloudflareZone } from "@/app/actions";
import { RecordCreateParams } from "cloudflare/resources/dns/records.mjs";
import { useToast } from "@/hooks/use-toast";

export default function SuperActionsMenu() {
  const { information, tailflareState } = useTailflare();
  const { toast } = useToast();

  async function handleAddAllHosts() {
    if (!information.cloudflare.selectedZone) {
      toast({
        title: "Missing target Cloudflare Zone",
        description: "Please select an available zone from the dropdown menu.",
      });
      return;
    }

    const selectedZoneId = information.cloudflare.selectedZone.id;
    const records: RecordCreateParams.CNAMERecord[] =
      information.tailscale.hosts.map((host) => ({
        name: `${host.split(".")[0]}${
          information.cloudflare.subdomain &&
          "." + information.cloudflare.subdomain
        }`,
        zone_id: selectedZoneId,
        type: "CNAME",
        content: host,
      }));

    const res = await createMultipleRecordsInCloudflareZone(
      records,
      tailflareState,
      information
    );

    toast({
      title: "Successfully executed batch action: Added all hosts.",
      description: JSON.stringify(res),
    });
  }

  async function handleRemoveAllHosts() {}

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
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={handleAddAllHosts}
        >
          <FolderPlusIcon />
          Add all hosts
        </DropdownMenuItem>
        <DropdownMenuItem disabled>
          <BoxesIcon /> Change all added subdomains
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-red-500"
          onClick={handleRemoveAllHosts}
        >
          <Trash2Icon /> Remove all hosts from Cloudflare
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
