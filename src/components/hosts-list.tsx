import { Information } from "@/lib/schema-type";
import { Button } from "./ui/button";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface HostsListProps {
  handleFetchCloudflare: () => void;
  information: Information;
}

export default function HostsList({
  handleFetchCloudflare,
  information,
}: HostsListProps) {
  const [selectedZone, setSelectedZone] = useState<string>();

  function handleSelectZone(id: string) {
    setSelectedZone(id);
  }

  return (
    <div className="gap-4 grid grid-cols-2 divide-x-2">
      <div className="p-2"></div>
      <div className="gap-2 grid p-2">
        <div className="relative mx-auto w-fit">
          <h2 className="font-bold text-2xl">Cloudflare</h2>
          <div className="top-2.5 -left-1 -z-10 absolute bg-orange-500/80 skew-x-6 w-32 h-4 -rotate-2"></div>
        </div>
        <Button onClick={handleFetchCloudflare}>Fetch Cloudflare Data</Button>

        <div className="items-center grid grid-cols-2">
          <Select onValueChange={handleSelectZone}>
            <SelectTrigger className="max-w-[300px]">
              <SelectValue placeholder="Select Cloudflare zone/domain" />
            </SelectTrigger>
            <SelectContent>
              {information.cloudflare.zones.map((zone) => (
                <SelectItem value={zone.id} key={zone.id}>
                  {zone.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span>Zone ID: {selectedZone}</span>
        </div>
      </div>
    </div>
  );
}
