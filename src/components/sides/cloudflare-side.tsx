import { useState, useEffect, useCallback } from "react";
import { useTailflare } from "@/contexts/tailflare-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { getCloudflareRecordsInZone, getCloudflareZones } from "@/app/actions";
import { debounce } from "lodash";
import { Information } from "@/lib/schema-type";
import { Spinner } from "../ui/spinner";
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

export default function CloudflareSide() {
  const { information, setInformation, tailflareState } = useTailflare();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSelectZone(id: string) {
    const records = await getCloudflareRecordsInZone(tailflareState, id);
    setInformation((prev: Information) => ({
      ...prev,
      cloudflare: {
        ...prev.cloudflare,
        selectedZone: id,
        dnsRecords: records,
      },
    }));
    toast({
      title: "Fetched records from selected zone",
    });
  }

  // Create a debounced version of the fetch function
  const debouncedFetch = useCallback(
    debounce(async () => {
      setIsLoading(true);
      try {
        const response = await getCloudflareZones(tailflareState);
        const zones = response.map((zone) => ({
          id: zone.id,
          name: zone.name,
        }));

        setInformation((prev: Information) => ({
          ...prev,
          cloudflare: {
            ...prev.cloudflare,
            zones,
          },
        }));
      } finally {
        setIsLoading(false);
      }
    }, 500),
    [tailflareState]
  );

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

  return (
    <SideContainer>
      <div className="relative mx-auto w-fit">
        <h2 className="font-bold text-2xl">Cloudflare</h2>
        <div className="top-2.5 -left-1 -z-10 absolute bg-orange-500/80 skew-x-6 w-32 h-4 -rotate-2" />
      </div>

      <div className="items-center gap-2">
        <div className="flex items-center text-ellipsis overflow-hidden">
          <Select
            onValueChange={handleSelectZone}
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
                  <span className="break-all">{`${idx + 1}. ${zone.name} - ${
                    zone.id
                  }`}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isLoading && <Spinner />}
        </div>
      </div>

      <div>
        <Table className="gap-2 grid">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">CNAME</TableHead>
              <TableHead className="w-[300px]">Content</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {information.cloudflare.dnsRecords.map((record) => (
              <HostItem key={record.id} record={record} />
            ))}
          </TableBody>
        </Table>
      </div>
    </SideContainer>
  );
}
