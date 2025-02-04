import { useTailflare } from "@/contexts/tailflare-context"
import SideContainer from "./side-container"
import { Input } from "../ui/input";
import { Label } from "../ui/label";

export default function TailscaleSide() {
  const { tailflareState, setTailflareState } = useTailflare();

  return <SideContainer>
    <div className="relative mx-auto w-fit">
      <h2 className="font-bold text-2xl text-background">Tailscale</h2>
      <div className="top-1.5 -left-1 -z-10 absolute bg-primary skew-x-6 w-32 h-6 -rotate-2"></div>
    </div>
    <div className="grid">
      <div className="mx-auto">
        <Input disabled value={tailflareState.tailnetOrganization ?? "Please add Tailnet Organization"} className="p-2 border rounded-md" />
      </div>
    </div>
  </SideContainer>
}