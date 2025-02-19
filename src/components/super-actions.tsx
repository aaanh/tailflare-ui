import { useTailflare } from "@/contexts/tailflare-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { BoxesIcon, FolderPlusIcon, Trash2Icon, ZapIcon } from "lucide-react";
import { cn, getDeepestSubdomain, handleForceRefresh } from "@/lib/utils";
import { buttonVariants } from "./ui/button";
import {
  createMultipleRecordsInCloudflareZone,
  deleteMultipleRecordsInCloudflareZone,
} from "@/app/actions";
import { RecordCreateParams } from "cloudflare/resources/dns/records.mjs";
import { useToast } from "@/hooks/use-toast";
import { getMatchedHosts } from "@/lib/utils";

export default function SuperActionsMenu() {
  const { information, tailflareState, setInformation } = useTailflare();
  const { toast } = useToast();

  async function handleAddAllHosts() {
    if (!information.cloudflare.selectedZone) {
      toast({
        title: "Missing target Cloudflare Zone",
        description: "Please select an available zone from the dropdown menu.",
      });

      await handleForceRefresh(tailflareState, information, setInformation, {
        fetchZones: false,
        fetchRecords: true,
        fetchHosts: false,
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

    await handleForceRefresh(tailflareState, information, setInformation, {
      fetchZones: false,
      fetchRecords: true,
      fetchHosts: false,
    });
  }

  async function handleRemoveAllHosts() {
    const matchedHosts = getMatchedHosts(
      information.tailscale.hosts,
      information.cloudflare.dnsRecords
    );

    if (matchedHosts.length === 0) {
      toast({
        title: "No hosts to remove",
        description: "There are no matched hosts in Cloudflare to remove.",
      });
      return;
    }

    try {
      const recordsToDelete = information.cloudflare.dnsRecords
        .filter((record) =>
          matchedHosts.some(
            (host) =>
              host &&
              getDeepestSubdomain(host) ===
                getDeepestSubdomain(record.name ?? "")
          )
        )
        .map((filtered) => {
          return { id: filtered.id };
        });

      await deleteMultipleRecordsInCloudflareZone(
        recordsToDelete,
        tailflareState,
        information
      );

      toast({
        title: "Successfully removed hosts",
        description: `Removed ${matchedHosts.length} DNS records from Cloudflare`,
      });

      await handleForceRefresh(tailflareState, information, setInformation, {
        fetchZones: false,
        fetchRecords: true,
        fetchHosts: false,
      });
    } catch (error) {
      toast({
        title: "Failed to remove hosts",
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });

      await handleForceRefresh(tailflareState, information, setInformation, {
        fetchZones: false,
        fetchRecords: true,
        fetchHosts: false,
      });
    }
  }

  /**
   *
   * @param from The subdomain to modify. Use '*' to target all matched hosts regardless of subdomain. Leave empty to target hosts under the domain, i.e. hostname.domain.tld
   * @param to
   */
  async function handleSubdomainBulkChange(from: string, to: string) {}

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <span
          className={cn(
            buttonVariants({ variant: "outline" }),
            "text-yellow-500"
          )}
        >
          <ZapIcon className="fill-yellow-500/50" /> Super Actions
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuItem
          className="text-affirmative cursor-pointer"
          onClick={handleAddAllHosts}
        >
          <FolderPlusIcon />
          Add all hosts
        </DropdownMenuItem>
        <DropdownMenuItem disabled>
          <BoxesIcon /> Change all added subdomains
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-red-500 cursor-pointer"
          onClick={handleRemoveAllHosts}
        >
          <Trash2Icon /> Remove all hosts from Cloudflare
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
