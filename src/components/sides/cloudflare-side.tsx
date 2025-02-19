import { useState, useEffect, useCallback } from "react";
import { useTailflare } from "@/contexts/tailflare-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  deleteRecordByIdFromCloudflare,
  getCloudflareRecordsInZone,
  getCloudflareZones,
} from "@/app/actions";
import { debounce } from "lodash";
import { Information } from "@/lib/schema-type";
import SideContainer from "./side-container";
import { toast } from "@/hooks/use-toast";
import HostItem from "./host-item";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { loadFromCache, saveToCache } from "@/lib/local-storage";
import { RefreshCw, TrashIcon } from "lucide-react";
import { Button } from "../ui/button";
import { getDeepestSubdomain } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { RecordResponse } from "cloudflare/resources/dns/records.mjs";
import { SelectSeparator } from "@radix-ui/react-select";
import { handleForceRefresh } from "@/lib/utils";

export default function CloudflareSide() {
  const { information, setInformation, tailflareState } = useTailflare();
  const [isLoading, setIsLoading] = useState(false);

  const debouncedFetch = useCallback(
    debounce(async () => {
      setIsLoading(true);
      try {
        const response = await getCloudflareZones(tailflareState);
        const zones = response.map((zone) => ({
          id: zone.id,
          name: zone.name,
        }));

        setInformation((prev: Information) => {
          const newInfo = {
            ...prev,
            cloudflare: {
              ...prev.cloudflare,
              zones,
            },
          };
          saveToCache(newInfo);
          return newInfo;
        });
      } finally {
        setIsLoading(false);
      }
    }, 500),
    [tailflareState, setInformation, setIsLoading]
  );

  async function handleSelectZone(id: string | undefined) {
    if (!id) {
      setInformation((prev: Information) => {
        const newInfo = {
          ...prev,
          cloudflare: {
            ...prev.cloudflare,
            selectedZone: undefined,
            dnsRecords: [],
          },
        };
        saveToCache(newInfo);
        return newInfo;
      });
      toast({
        title: "Clear zone selection",
      });

      return;
    }

    const records = await getCloudflareRecordsInZone(tailflareState, id);
    const selectedZone = information.cloudflare.zones.find(
      (zone) => zone.id === id
    );

    if (!selectedZone) {
      toast({
        title: "Error",
        description: "Selected zone not found",
        variant: "destructive",
      });
      return;
    }

    setInformation((prev: Information) => {
      const newInfo = {
        ...prev,
        cloudflare: {
          ...prev.cloudflare,
          selectedZone: {
            id: selectedZone.id,
            name: selectedZone.name,
          },
          dnsRecords: records,
        },
      };
      saveToCache(newInfo);
      return newInfo;
    });
    toast({
      title: "Fetched records from selected zone",
    });
  }

  async function handleRefresh() {
    setIsLoading(true);
    try {
      const result = await handleForceRefresh(
        tailflareState,
        information,
        setInformation,
        { fetchHosts: false }
      );
      if (result.success) {
        toast({
          title: "Cache refreshed successfully",
        });
      } else {
        throw result.error;
      }
    } catch (error) {
      toast({
        title: "Failed to refresh cache",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Load cached data on mount
  useEffect(() => {
    const cached = loadFromCache();
    if (cached) {
      setInformation(cached);
    }
  }, [setInformation]);

  // Set up effect to fetch data when cloudflare state changes
  useEffect(() => {
    if (tailflareState.cloudflareApiKey && tailflareState.cloudflareApiEmail) {
      debouncedFetch();
    }

    // Cleanup function to cancel pending debounced calls
    return () => {
      debouncedFetch.cancel();
    };
  }, [tailflareState, debouncedFetch]);

  async function handleDeleteDnsRecord(record: RecordResponse) {
    toast({
      title: "Deleting record from Cloudflare",
    });
    try {
      await deleteRecordByIdFromCloudflare(tailflareState, record.id, {
        zone_id: information.cloudflare.selectedZone?.id ?? "",
      });
      toast({
        title: `Deleted ${record.name} from Cloudflare`,
      });

      handleRefresh();
    } catch {
      handleRefresh();
      toast({ title: "Unable to delete DNS record from Cloudflare" });
    }
  }

  return (
    <SideContainer>
      <div className="relative mx-auto w-fit">
        <h2 className="font-bold text-2xl text-orange-500">Cloudflare</h2>
      </div>

      <div className="items-center gap-2">
        <div className="flex items-center gap-2 overflow-hidden text-ellipsis">
          <Select
            onValueChange={handleSelectZone}
            value={information.cloudflare.selectedZone?.id}
            disabled={information.cloudflare.zones.length === 0}
          >
            <SelectTrigger className="bg-background">
              <SelectValue
                className=""
                placeholder={
                  information.cloudflare.zones.length === 0
                    ? "No zones available"
                    : "Select zone"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {information.cloudflare.zones.map((zone, idx) => (
                <SelectItem value={zone.id} key={zone.id}>
                  <span className="break-all">{`${idx + 1}. ${zone.name} - ${zone.id
                    }`}</span>
                </SelectItem>
              ))}
              <SelectSeparator />
              <Button
                className="px-2 w-full"
                variant="secondary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectZone(undefined);
                }}
              >
                Clear
              </Button>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="mb-2 font-semibold text-lg">Matched Records</h3>
          <Table className="gap-2 grid">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[400px]">CNAME</TableHead>
                <TableHead className="w-[400px]">Content</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {information.cloudflare.dnsRecords
                .filter(
                  (record) =>
                    record &&
                    information.tailscale.hosts.some(
                      (host) =>
                        getDeepestSubdomain(host) ===
                        getDeepestSubdomain(record.name ?? "")
                    )
                )
                .map((record) =>
                  record ? (
                    <HostItem key={record.id} record={record}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant={"outline"}
                            size={"icon"}
                            onClick={async () =>
                              await handleDeleteDnsRecord(record)
                            }
                            className="hidden group-hover:inline-flex"
                          >
                            <TrashIcon />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Delete DNS record from Cloudflare</p>
                        </TooltipContent>
                      </Tooltip>
                    </HostItem>
                  ) : null
                )}
            </TableBody>
          </Table>
        </div>

        <div>
          <h3 className="mb-2 font-semibold text-lg">Unmatched Records</h3>
          <Table className="gap-2 grid">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[400px]">CNAME</TableHead>
                <TableHead className="w-[400px]">Content</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {information.cloudflare.dnsRecords
                .filter(
                  (record) =>
                    record &&
                    !information.tailscale.hosts.some(
                      (host) =>
                        getDeepestSubdomain(host) ===
                        getDeepestSubdomain(record.name ?? "")
                    )
                )
                .map((record) =>
                  record ? <HostItem key={record.id} record={record} /> : null
                )}
            </TableBody>
          </Table>
        </div>
      </div>
    </SideContainer>
  );
}
