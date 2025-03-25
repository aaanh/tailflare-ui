import { useTailflare } from "@/contexts/tailflare-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  BoxesIcon,
  ChevronDownIcon,
  FolderPlusIcon,
  LandPlotIcon,
  TargetIcon,
  Trash2Icon,
  ZapIcon,
} from "lucide-react";
import { cn, getDeepestSubdomain, handleForceRefresh } from "@/lib/utils";
import { Button, buttonVariants } from "./ui/button";
import {
  createMultipleRecordsInCloudflareZone,
  deleteMultipleRecordsInCloudflareZone,
  UpdateMultipleRecordsInCloudflareZone,
} from "@/app/actions";
import {
  BatchPatchParam,
  RecordCreateParams,
  RecordResponse,
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
import {
  DialogClose,
  DialogDescription,
  DialogTrigger,
} from "@radix-ui/react-dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import usageText from "@/lib/usage-text";

export default function SuperActionsMenu() {
  const { appData, credentials, setAppData } = useTailflare();
  const { toast } = useToast();
  const [bulkSubdomainChangeParams, setSubdomainChangeParams] = useState<{
    from: string;
    to: string;
  }>({
    from: "",
    to: "",
  });

  async function handleAddAllHosts() {
    if (!appData.cloudflare.selectedZone) {
      toast({
        title: "Missing target Cloudflare Zone",
        description: "Please select an available zone from the dropdown menu.",
      });

      await handleForceRefresh(credentials, appData, setAppData, {
        fetchZones: false,
        fetchRecords: true,
        fetchHosts: false,
      });

      return;
    }

    const selectedZoneId = appData.cloudflare.selectedZone.id;
    const records: RecordCreateParams.CNAMERecord[] =
      appData.tailscale.hosts.map((host) => ({
        name: `${host.split(".")[0]}${
          appData.cloudflare.subdomain && "." + appData.cloudflare.subdomain
        }`,
        zone_id: selectedZoneId,
        type: "CNAME",
        content: host,
      }));

    const res = await createMultipleRecordsInCloudflareZone(
      records,
      credentials,
      appData
    );

    toast({
      title: "Successfully executed batch action: Added all hosts.",
      description: JSON.stringify(res),
    });

    await handleForceRefresh(credentials, appData, setAppData, {
      fetchZones: false,
      fetchRecords: true,
      fetchHosts: false,
    });
  }

  async function handleRemoveAllHosts() {
    const matchedHosts = getMatchedHosts(
      appData.tailscale.hosts,
      appData.cloudflare.dnsRecords
    );

    if (matchedHosts.length === 0) {
      toast({
        title: "No hosts to remove",
        description: "There are no matched hosts in Cloudflare to remove.",
      });
      return;
    }

    try {
      const recordsToDelete = appData.cloudflare.dnsRecords
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
        credentials,
        appData
      );

      toast({
        title: "Successfully removed hosts",
        description: `Removed ${matchedHosts.length} DNS records from Cloudflare`,
      });

      await handleForceRefresh(credentials, appData, setAppData, {
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

      await handleForceRefresh(credentials, appData, setAppData, {
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

    const matchedHosts: BatchPatchParam.CNAME[] =
      appData.cloudflare.dnsRecords.filter((record) =>
        appData.tailscale.hosts.some(
          (host) =>
            host &&
            getDeepestSubdomain(host) === getDeepestSubdomain(record.name ?? "")
        )
      ) as RecordResponse.CNAME[];

    console.log("Matched hosts", matchedHosts);

    let prepped = [];

    switch (from) {
      case "*":
        prepped = matchedHosts.map((record) => ({
          id: record.id,
          name:
            getDeepestSubdomain(record.name ?? "") +
            (to.length > 0 ? `.${to}` : ""),
        }));
        break;
      case "":
        prepped = matchedHosts
          .filter((record) => record.name?.split(".").length === 3)
          .map((record) => ({
            id: record.id,
            name:
              getDeepestSubdomain(record.name ?? "") +
              (to.length > 0 ? `.${to}` : ""),
          }));
        break;
      default:
        prepped = matchedHosts
          .filter((record) => record.name?.includes(from))
          .map((record) => ({
            id: record.id,
            name:
              getDeepestSubdomain(record.name ?? "") +
              (to.length > 0 ? `.${to}` : ""),
          }));
    }

    console.log("Prepped", prepped);

    const res = await UpdateMultipleRecordsInCloudflareZone(
      prepped,
      credentials,
      appData
    );

    toast({
      title: "Executed batch update",
      description: JSON.stringify(res),
    });

    await handleForceRefresh(credentials, appData, setAppData, {
      fetchZones: false,
      fetchRecords: true,
      fetchHosts: true,
    });
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
                <DialogDescription>
                  {usageText.bulkChangeSubdomains}
                </DialogDescription>
              </DialogHeader>
              <div className="gap-2 grid">
                <div className="items-center gap-1 grid grid-cols-[1fr_2fr]">
                  <Label className="flex items-center gap-2">
                    <LandPlotIcon />
                    Source subdomain
                  </Label>
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
                <div className="items-center gap-1 grid grid-cols-[1fr_2fr]">
                  <Label className="flex items-center gap-2">
                    <TargetIcon />
                    Target subdomain
                  </Label>
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
                <div className="gap-2 grid">
                  <span className="p-1 border rounded-lg text-destructive text-center cursor-default">
                    {`<hostname>.${
                      bulkSubdomainChangeParams.from.length > 0
                        ? bulkSubdomainChangeParams.from
                        : "<not set>"
                    }.${appData.cloudflare.selectedZone?.name}`}{" "}
                  </span>
                  <div className="flex justify-center items-center">
                    <ChevronDownIcon />
                  </div>
                  <span className="p-1 border rounded-lg text-affirmative text-center cursor-default">
                    {`<hostname>.${
                      bulkSubdomainChangeParams.to.length > 0
                        ? bulkSubdomainChangeParams.to
                        : "<not set>"
                    }.${appData.cloudflare.selectedZone?.name}`}
                  </span>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant={"destructive"}>Cancel</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button
                    variant={"affirmative"}
                    onClick={handleSubdomainBulkChange}
                  >
                    Execute
                  </Button>
                </DialogClose>
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
