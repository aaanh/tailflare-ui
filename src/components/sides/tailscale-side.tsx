import { useTailflare } from "@/contexts/tailflare-context";
import SideContainer from "./side-container";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

export default function TailscaleSide() {
  const { tailflareState, setTailflareState } = useTailflare();

  return (
    <SideContainer>
      <div className="relative flex flex-col gap-2 mx-auto w-fit">
        <h2 className="font-bold text-2xl text-background">Tailscale</h2>
        <div className="top-1.25 -left-1 -z-10 absolute bg-primary skew-x-6 w-36 h-7 -rotate-2"></div>
        <Input
          disabled
          value={
            tailflareState.tailnetOrganization ??
            "Please add Tailnet Organization"
          }
          className="bg-background p-2 border rounded-md text-primary"
        />
      </div>
    </SideContainer>
  );
}
