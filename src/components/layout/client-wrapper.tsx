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

export default function ClientWrapper() {
  return (
    <ThemeProvider attribute="class"
      defaultTheme="system"
      enableSystem
    >

      <TailflareProvider>
        <Header />
        <ApiKeyStatus />
        <SubdomainDialog />
        <div className="gap-2 grid lg:grid-cols-2">
          <TailscaleSide />
          <CloudflareSide />
        </div>
        <Toaster />
      </TailflareProvider>
      <Footer />
    </ThemeProvider>
  );
} 