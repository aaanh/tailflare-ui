import SideContainer from "./side-container"

export default function TailscaleSide() {
  return <SideContainer>
    <div className="relative mx-auto w-fit">
      <h2 className="font-bold text-2xl text-background">Tailscale</h2>
      <div className="top-1.5 -left-1 -z-10 absolute bg-primary skew-x-6 w-32 h-6 -rotate-2"></div>
    </div>
  </SideContainer>
}