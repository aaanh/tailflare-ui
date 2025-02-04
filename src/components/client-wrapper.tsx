"use client";

import { TailflareProvider, useTailflare } from "@/contexts/tailflare-context";
import CloudflareSide from "./cloudflare-side";
import KeyEntryDialog, { ApiKeyStatus } from "./key-entry-dialog";
import { Toaster } from "./ui/toaster";
import TailscaleSide from "./tailscale-side";
import Header from "./header";
import { ThemeProvider } from "./theme-provider";
import Footer from "./footer";

export default function ClientWrapper() {
  return (
    <ThemeProvider attribute="class"
      defaultTheme="system"
      enableSystem
    >

      <TailflareProvider>
        <Header />
        <ApiKeyStatus />
        <div className="gap-4 grid grid-cols-2">
          <TailscaleSide />
          <CloudflareSide />
        </div>
        <Toaster />
      </TailflareProvider>
      <Footer />
    </ThemeProvider>
  );
} 