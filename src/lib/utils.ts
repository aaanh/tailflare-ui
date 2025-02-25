import {
  getCloudflareRecordsInZone,
  getCloudflareZones,
  getTailscaleHosts,
} from "@/app/actions";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { saveToCache } from "./local-storage";
import { AppData, Credentials } from "./schema-type";
import { RecordResponse } from "cloudflare/resources/dns/records.mjs";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Utility function to derive an encryption key from the stored hashKey
export async function deriveKey(hashKey: string) {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(hashKey),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: encoder.encode("static-salt"), // Static salt (better to generate and store separately)
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

// Encrypts a string using AES-GCM
export async function encryptData(plainText: string, hashKey: string) {
  const key = await deriveKey(hashKey);
  const iv = crypto.getRandomValues(new Uint8Array(12)); // Initialization Vector
  const encodedText = new TextEncoder().encode(plainText);
  const encryptedData = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encodedText
  );

  // Combine IV and encrypted data as a base64 string
  return btoa(
    String.fromCharCode(...iv) +
      String.fromCharCode(...new Uint8Array(encryptedData))
  );
}

// Decrypts a string using AES-GCM
export async function decryptData(encryptedText: string, hashKey: string) {
  try {
    const key = await deriveKey(hashKey);
    const encryptedBytes = atob(encryptedText)
      .split("")
      .map((c) => c.charCodeAt(0));
    const iv = new Uint8Array(encryptedBytes.slice(0, 12)); // Extract IV
    const encryptedContent = new Uint8Array(encryptedBytes.slice(12)); // Extract encrypted data

    const decryptedData = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      encryptedContent
    );

    return new TextDecoder().decode(decryptedData);
  } catch (error) {
    console.error("Error decrypting data:", error);
    return null;
  }
}

export function getDeepestSubdomain(hostname: string): string {
  return hostname.split(".")[0];
}

export function getMatchedHosts(
  tailscaleHosts: string[],
  cloudflareRecords: RecordResponse[]
) {
  return tailscaleHosts.filter((host) =>
    cloudflareRecords.some(
      (record) =>
        record &&
        getDeepestSubdomain(host) === getDeepestSubdomain(record.name ?? "")
    )
  );
}

export function getUnmatchedHosts(
  tailscaleHosts: string[],
  cloudflareRecords: RecordResponse[]
) {
  return tailscaleHosts.filter(
    (host) =>
      !cloudflareRecords.some(
        (record) =>
          record &&
          getDeepestSubdomain(host) === getDeepestSubdomain(record.name ?? "")
      )
  );
}

export async function handleForceRefresh(
  credentials: Credentials,
  appData: AppData,
  setAppData: (info: AppData) => void,
  options?: {
    fetchZones?: boolean;
    fetchRecords?: boolean;
    fetchHosts?: boolean;
  }
) {
  const {
    fetchZones = true,
    fetchRecords = true,
    fetchHosts = true,
  } = options ?? {};

  try {
    const newInfo = { ...appData };

    // Fetch Cloudflare zones if requested
    if (fetchZones) {
      const response = await getCloudflareZones(credentials);
      const zones = response.map((zone) => ({
        id: zone.id,
        name: zone.name,
      }));
      newInfo.cloudflare = {
        ...newInfo.cloudflare,
        zones,
      };
    }

    // Fetch DNS records if there's a selected zone and requested
    if (fetchRecords && appData.cloudflare.selectedZone) {
      const records = await getCloudflareRecordsInZone(
        credentials,
        appData.cloudflare.selectedZone.id
      );
      newInfo.cloudflare = {
        ...newInfo.cloudflare,
        dnsRecords: records,
      };
    }

    // Fetch Tailscale hosts if requested
    if (fetchHosts) {
      const res = await getTailscaleHosts(credentials);
      const hosts = res.devices.map(
        (device: { name: string }) => device.name
      ) as string[];
      newInfo.tailscale = {
        ...newInfo.tailscale,
        hosts,
      };
    }

    setAppData(newInfo);
    saveToCache(newInfo);

    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
}
