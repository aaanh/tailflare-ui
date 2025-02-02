"use client";

import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { TailflareState } from "@/lib/schema-type";
import { useState } from "react";

interface KeyEntryFormProps {
  tailflareState: TailflareState;
  setTailflareState: (newState: TailflareState) => void;
  showSecrets: boolean;
}

const fieldMap: Record<string, keyof TailflareState> = {
  "tailscale-api-key": "tailscaleApiKey",
  "cloudflare-api-key": "cloudflareApiKey",
  "tailnet-organization": "tailnetOrganization",
  "cloudflare-api-email": "cloudflareApiEmail",
};

export default function KeyEntryForm({
  tailflareState,
  setTailflareState,
  showSecrets,
}: KeyEntryFormProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    const stateKey = fieldMap[id];
    if (stateKey) {
      setTailflareState({
        ...tailflareState,
        [stateKey]: value,
      });
    }
  };

  return (
    <form className="gap-4 grid grid-cols-2">
      {/* Tailscale column */}
      <div className="grid">
        <div className="items-center gap-1 grid">
          <Label className="text-lg" htmlFor="tailnet-organization">
            Tailnet Organization
          </Label>
          <Input
            value={tailflareState.tailnetOrganization}
            id="tailnet-organization"
            onChange={handleChange}
          />
        </div>
        <div className="items-center gap-1 grid">
          <Label className="text-lg" htmlFor="tailscale-api-key">
            Tailscale API key
          </Label>
          <Input
            value={tailflareState.tailscaleApiKey}
            id="tailscale-api-key"
            type={showSecrets ? "text" : "password"}
            onChange={handleChange}
          />
        </div>
      </div>
      {/* Cloudflare column */}
      <div className="grid">
        <div className="items-center gap-1 grid">
          <Label className="text-lg" htmlFor="cloudflare-zone-id">
            Cloudflare API Email
          </Label>
          <Input
            value={tailflareState.cloudflareApiEmail ?? ""}
            id="cloudflare-api-email"
            onChange={handleChange}
          />
        </div>
        <div className="items-center gap-1 grid">
          <Label className="text-lg" htmlFor="cloudflare-api-key">
            Cloudflare API key
          </Label>
          <Input
            value={tailflareState.cloudflareApiKey}
            id="cloudflare-api-key"
            type={showSecrets ? "text" : "password"}
            onChange={handleChange}
          />
        </div>
      </div>
    </form>
  );
}
