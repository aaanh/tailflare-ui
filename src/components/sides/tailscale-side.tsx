import { useTailflare } from "@/contexts/tailflare-context";
import SideContainer from "./side-container";
import { Input } from "../ui/input";
import { getTailscaleHosts } from "@/app/actions";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import HostItem from "./host-item";
import { useState, useEffect, useCallback } from "react";
import { debounce } from "lodash";
import { Spinner } from "../ui/spinner";
import { toast } from "@/hooks/use-toast";
import { loadFromCache, saveToCache } from "@/lib/local-storage";
import { RefreshCw } from "lucide-react";
import { Button } from "../ui/button";

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

  return (
    <SideContainer>
      <div className="relative flex flex-col gap-2 mx-auto w-fit">
        <h2 className="font-bold text-2xl text-background">Tailscale</h2>
        <div className="top-1.25 -left-1 -z-10 absolute bg-primary skew-x-6 w-36 h-7 -rotate-2"></div>
        <div className="flex items-center gap-2">
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
          {isLoading && <Spinner />}
        </div>
      </div>

      <div>
        <Table className="gap-2 grid">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[400px]">FQDN</TableHead>
              {/* <TableHead className="w-[400px]">Other info</TableHead> */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {information.tailscale.hosts.map((host) => (
              <HostItem
                key={host}
                record={{
                  id: "placeholder-id",
                  created_on: new Date().toISOString(),
                  meta: {},
                  modified_on: new Date().toISOString(),
                  proxiable: false,
                  name: host,
                  content: "",
                }}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </SideContainer>
  );
}
