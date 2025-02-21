import { useTailflare } from "@/contexts/tailflare-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { BoxesIcon, FolderPlusIcon, Trash2Icon, ZapIcon } from "lucide-react";
import { cn, getDeepestSubdomain, handleForceRefresh } from "@/lib/utils";
import { Button, buttonVariants } from "./ui/button";
import {
  createMultipleRecordsInCloudflareZone,
  deleteMultipleRecordsInCloudflareZone,
} from "@/app/actions";
import {
  BatchPatchParam,
  RecordCreateParams,
} from "cloudflare/resources/dns/records.mjs";
import { useToast } from "@/hooks/use-toast";
import { getMatchedHosts } from "@/lib/utils";
import { SubdomainSchema } from "@/lib/schema-type";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { DialogDescription, DialogTrigger } from "@radix-ui/react-dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export default function SuperActionsMenu() {
  const { information, tailflareState, setInformation } = useTailflare();
  const { toast } = useToast();
  const [bulkSubdomainChangeParams, setSubdomainChangeParams] = useState<{
    from: string;
    to: string;
  }>({
    from: "",
    to: "",
  });

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
   * This handler is called when the bulk change button is clicked. It preps the input parameters and call the server-side action that handles updating multiple records. There is no mutations nor extern API calls to Tailscale, only on Cloudflare.
   *
   * @param from The subdomain to modify. Use '*' to target all matched hosts regardless of subdomain. Leave empty to target hosts under the domain, i.e. hostname.domain.tld
   * @param to Specify subdomain(s) only. E.g. engineering.workstations OR build.servers -> hostname.{engineering OR build}.{workstations OR servers}
   */
  async function handleSubdomainBulkChange() {
    const { from, to } = bulkSubdomainChangeParams;

    const sourceSubdomain = SubdomainSchema.safeParse(from);
    const matchedHosts: BatchPatchParam.CNAMERecord[] =
      information.cloudflare.dnsRecords
        .filter((record) =>
          information.tailscale.hosts.some(
            (host) =>
              host &&
              getDeepestSubdomain(host) ===
                getDeepestSubdomain(record.name ?? "")
          )
        )
        .filter((record) =>
          record?.name?.includes(from)
        ) as BatchPatchParam.CNAMERecord[];
    console.log(matchedHosts);
  }

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
        <DropdownMenuItem asChild>
          <Dialog>
            <DialogTrigger asChild>
              <span className="flex items-center gap-2 hover:bg-foreground/20 p-2 rounded-lg text-sm cursor-pointer">
                <BoxesIcon size={24} /> Change all added subdomains
              </span>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Changing all added subdomains</DialogTitle>
              </DialogHeader>
              <div>
                <div>
                  <Label>Source subdomain</Label>
                  <Input
                    value={bulkSubdomainChangeParams.from}
                    onChange={(e) =>
                      setSubdomainChangeParams((prev) => ({
                        ...prev,
                        from: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label>Target subdomain</Label>
                  <Input
                    value={bulkSubdomainChangeParams.to}
                    onChange={(e) =>
                      setSubdomainChangeParams((prev) => ({
                        ...prev,
                        to: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleSubdomainBulkChange}>Execute</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
