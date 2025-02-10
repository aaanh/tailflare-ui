import { useTailflare } from "@/contexts/tailflare-context";
import SideContainer from "./side-container";
import { Input } from "../ui/input";
import {
  createCloudflareRecordInZone,
  getCloudflareRecordsInZone,
  getTailscaleHosts,
} from "@/app/actions";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import HostItem from "./host-item";
import { useState, useEffect, useCallback, ReactNode } from "react";
import { debounce } from "lodash";
import { Spinner } from "../ui/spinner";
import { toast } from "@/hooks/use-toast";
import { loadFromCache, saveToCache } from "@/lib/local-storage";
import { ArrowRightToLineIcon, RefreshCw } from "lucide-react";
import { Button } from "../ui/button";
import { getDeepestSubdomain } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { record } from "zod";

export default function TailscaleSide() {
  const { tailflareState, information, setInformation } = useTailflare();
  const [isLoading, setIsLoading] = useState(false);

  // Create a debounced version of the fetch function
  const debouncedFetch = useCallback(
    debounce(async () => {
      setIsLoading(true);
      try {
        const res = await getTailscaleHosts(tailflareState);
        const hosts = res.devices.map(
          (device: { name: string }) => device.name
        ) as string[];
        setInformation((prev) => {
          const newInfo = {
            ...prev,
            tailscale: {
              hosts: hosts,
            },
          };
          saveToCache(newInfo);
          return newInfo;
        });
        toast({
          title: "Fetched hosts from Tailnet",
        });
      } catch (error) {
        toast({
          title: "Failed to fetch Tailnet hosts",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }, 500),
    [tailflareState]
  );

  // Load cached data on mount
  useEffect(() => {
    const cached = loadFromCache();
    if (cached) {
      setInformation(cached);
    }
  }, []);

  useEffect(() => {
    if (tailflareState.tailscaleApiKey && tailflareState.tailnetOrganization) {
      debouncedFetch();
    }

    return () => {
      debouncedFetch.cancel();
    };
  }, [tailflareState, debouncedFetch]);

  async function handleForceRefresh() {
    setIsLoading(true);
    try {
      const res = await getTailscaleHosts(tailflareState);
      const hosts = res.devices.map(
        (device: { name: string }) => device.name
      ) as string[];

      setInformation((prev) => {
        const newInfo = {
          ...prev,
          tailscale: {
            hosts: hosts,
          },
        };
        saveToCache(newInfo);
        return newInfo;
      });

      toast({
        title: "Cache refreshed successfully",
      });
    } catch (error) {
      toast({
        title: "Failed to refresh cache",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSyncHostToCloudflare(fqdn: string) {
    const hostname = fqdn.split(".")[0];
    try {
      const res = await createCloudflareRecordInZone(tailflareState, {
        name: `${hostname}.${information.cloudflare.subdomain}`,
        content: fqdn,
        zone_id: information.cloudflare.selectedZone?.id ?? "",
        type: "CNAME",
      });
      toast({
        title: `Added ${fqdn} to Cloudflare`,
        description: `${res.id}`,
      });

      // Force refresh after successful addition
      await handleForceRefresh();

      // Also refresh Cloudflare records
      if (information.cloudflare.selectedZone) {
        const records = await getCloudflareRecordsInZone(
          tailflareState,
          information.cloudflare.selectedZone.id
        );

        setInformation((prev) => {
          const newInfo = {
            ...prev,
            cloudflare: {
              ...prev.cloudflare,
              dnsRecords: records,
            },
          };
          saveToCache(newInfo);
          return newInfo;
        });
      }
    } catch (e) {
      const err = (e as string)
        .toString()
        .substring((e as string).toString().indexOf("{"));

      const parsed_err = JSON.parse(err) as {
        result: null;
        success: boolean;
        errors: {
          code: number;
          message: string;
        }[];
      };

      toast({
        title: "Error occurred while adding host to Cloudflare",
        description: `${parsed_err.errors[0].code} - ${parsed_err.errors[0].message}`,
      });
    }
  }

  return (
    <SideContainer>
      <div className="flex flex-col gap-2 mx-auto w-fit">
        <div className="relative">
          <h2 className="font-bold text-2xl text-background text-center">
            Tailscale
          </h2>
          <div className="top-0 left-10 -z-10 absolute bg-primary skew-x-6 w-36 h-7 -rotate-2"></div>
        </div>
        <div className="flex justify-center items-center gap-2">
          <Input
            disabled
            value={
              tailflareState.tailnetOrganization ??
              "Please add Tailnet Organization"
            }
            className="bg-background p-2 border rounded-md text-primary"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={handleForceRefresh}
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
          <h3 className="mb-2 font-semibold text-lg">Matched Hosts</h3>
          <Table className="gap-2 grid">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[600px]">FQDN</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {information.tailscale.hosts
                .filter((host) =>
                  information.cloudflare.dnsRecords.some(
                    (record) =>
                      record &&
                      getDeepestSubdomain(host) ===
                        getDeepestSubdomain(record.name ?? "")
                  )
                )
                .map((host) => (
                  <HostItem
                    key={host}
                    record={{
                      id: "placeholder-id",
                      created_on: new Date().toISOString(),
                      meta: {},
                      modified_on: new Date().toISOString(),
                      proxiable: false,
                      name: host,
                      content: undefined,
                    }}
                  ></HostItem>
                ))}
            </TableBody>
          </Table>
        </div>

        <div>
          <h3 className="mb-2 font-semibold text-lg">Unmatched Hosts</h3>
          <Table className="gap-2 grid">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[600px]">FQDN</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {information.tailscale.hosts
                .filter(
                  (host) =>
                    !information.cloudflare.dnsRecords.some(
                      (record) =>
                        record &&
                        getDeepestSubdomain(host) ===
                          getDeepestSubdomain(record.name ?? "")
                    )
                )
                .map((host) => (
                  <HostItem
                    key={host}
                    record={{
                      id: "placeholder-id",
                      created_on: new Date().toISOString(),
                      meta: {},
                      modified_on: new Date().toISOString(),
                      proxiable: false,
                      name: host,
                      content: undefined,
                    }}
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={"outline"}
                          size={"icon"}
                          onClick={async () =>
                            await handleSyncHostToCloudflare(host)
                          }
                          className="group-hover:inline-flex hidden"
                        >
                          <ArrowRightToLineIcon />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Sync {`${host} to Cloudflare`}</p>
                      </TooltipContent>
                    </Tooltip>
                  </HostItem>
                ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </SideContainer>
  );
}
