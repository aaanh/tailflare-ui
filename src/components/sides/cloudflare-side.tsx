import { useState, useEffect, useCallback } from "react";
import { useTailflare } from "@/contexts/tailflare-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { getCloudflareZones } from "@/app/actions";
import { debounce } from "lodash";
import { Information } from "@/lib/schema-type";
import { Spinner } from "../ui/spinner";
import SideContainer from "./side-container";

export default function CloudflareSide() {
  const [selectedZone, setSelectedZone] = useState<string>();
  const { information, setInformation, tailflareState } = useTailflare();
  const [isLoading, setIsLoading] = useState(false);

  function handleSelectZone(id: string) {
    setSelectedZone(id);
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
    if (tailflareState.cloudflareApiKey) {
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
        <div className="top-2.5 -left-1 -z-10 absolute bg-orange-500/80 skew-x-6 w-32 h-4 -rotate-2"></div>
      </div>

      <div className="items-center gap-2">
        <div className="flex items-center overflow-hidden text-ellipsis">
          <Select onValueChange={handleSelectZone} disabled={information.cloudflare.zones.length === 0}>
            <SelectTrigger className="bg-background">
              <SelectValue className="" placeholder={
                information.cloudflare.zones.length === 0
                  ? "No zones available"
                  : "Select zone"
              } />
            </SelectTrigger>
            <SelectContent>
              {information.cloudflare.zones.map((zone) => (
                <SelectItem value={zone.id} key={zone.id}>
                  <span className="break-all">{zone.name}</span>
                  {" - "}
                  <span className="break-all">{zone.id}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isLoading && <Spinner />}
        </div>

      </div>
    </SideContainer>

  );
}
