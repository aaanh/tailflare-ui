"use client";

import { TailflareProvider } from "@/contexts/tailflare-context";
import CloudflareSide from "../sides/cloudflare-side";
import { Toaster } from "../ui/toaster";
import TailscaleSide from "../sides/tailscale-side";
import Header from "./header";
import { ThemeProvider } from "../theme-provider";
import Footer from "./footer";
import { ApiKeyStatus } from "../api-key-status";
import { SubdomainDialog } from "../subdomain-dialog";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import SuperActionsMenu from "../super-actions";

export default function ClientWrapper() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <TailflareProvider>
          <Header />
          <ApiKeyStatus />
          <div className="flex flex-wrap gap-2">
            <SubdomainDialog />
            <SuperActionsMenu />
          </div>
          <div className="gap-2 grid lg:grid-cols-2">
            <TailscaleSide />
            <CloudflareSide />
          </div>
          <Toaster />
        </TailflareProvider>
        <Footer />
      </TooltipProvider>
    </ThemeProvider>
  );
}
