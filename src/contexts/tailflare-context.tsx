"use client";

import { Information, TailflareState } from "@/lib/schema-type";
import { createContext, useContext, useState, ReactNode } from "react";

interface TailflareContextType {
  information: Information;
  setInformation: React.Dispatch<React.SetStateAction<Information>>;
  tailflareState: TailflareState;
  setTailflareState: (state: TailflareState) => void;
}

const TailflareContext = createContext<TailflareContextType | undefined>(
  undefined
);

export function TailflareProvider({ children }: { children: ReactNode }) {
  const [tailflareState, setTailflareState] = useState<TailflareState>({
    cloudflareApiEmail: "",
    cloudflareApiKey: "",
    tailnetOrganization: "",
    tailscaleApiKey: "",
  });

  const [information, setInformation] = useState<Information>({
    tailscale: {
      hosts: [],
    },
    cloudflare: {
      zones: [],
      dnsRecords: [],
    },
  });

  return (
    <TailflareContext.Provider
      value={{
        information,
        setInformation,
        tailflareState,
        setTailflareState,
      }}
    >
      {children}
    </TailflareContext.Provider>
  );
}

export function useTailflare() {
  const context = useContext(TailflareContext);
  if (context === undefined) {
    throw new Error("useTailflare must be used within a TailflareProvider");
  }
  return context;
}
