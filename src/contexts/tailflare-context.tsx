"use client";

import { AppData, Credentials } from "@/lib/schema-type";
import { createContext, useContext, useState, ReactNode } from "react";

interface TailflareContextType {
  appData: AppData;
  setAppData: React.Dispatch<React.SetStateAction<AppData>>;
  credentials: Credentials;
  setCredentials: (state: Credentials) => void;
}

const TailflareContext = createContext<TailflareContextType | undefined>(
  undefined
);

export function TailflareProvider({ children }: { children: ReactNode }) {
  const [credentials, setCredentials] = useState<Credentials>({
    cloudflareApiEmail: "",
    cloudflareApiKey: "",
    tailnetOrganization: "",
    tailscaleApiKey: "",
  });

  const [appData, setAppData] = useState<AppData>({
    tailscale: {
      hosts: [],
    },
    cloudflare: {
      zones: [],
      dnsRecords: [],
      subdomain: "",
    },
  });

  return (
    <TailflareContext.Provider
      value={{
        appData,
        setAppData,
        credentials,
        setCredentials,
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
