"use client";

import DataNotice from "@/components/data-notice";
import HostsList from "@/components/hosts-list";
import KeyEntryForm from "@/components/key-entry-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
  DialogDescription,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { Information, TailflareState } from "@/lib/schema-type";
import Cloudflare from "cloudflare";
import { Eye, EyeClosed } from "lucide-react";
import { useEffect, useState } from "react";
import { getCloudflareZones } from "./actions";

// Utility function to derive an encryption key from the stored hashKey
async function deriveKey(hashKey: string) {
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
async function encryptData(plainText: string, hashKey: string) {
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
async function decryptData(encryptedText: string, hashKey: string) {
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

export default function Home() {
  const [hashKey, setHashKey] = useState<string | null>(null);
  const [tailflareState, setTailflareState] = useState<TailflareState>({
    cloudflareApiEmail: "",
    cloudflareApiKey: "",
    tailnetOrganization: "",
    tailscaleApiKey: "",
  });
  const [showSecrets, setShowSecrets] = useState(false);
  const [information, setInformation] = useState<Information>({
    tailscale: {
      hosts: [],
    },
    cloudflare: {
      zones: [],
    },
  });

  useEffect(() => {
    async function retrieveAndDecryptState() {
      let storedKey = localStorage.getItem("hashKey");

      // Generate and store a new key if one doesn't exist
      if (!storedKey) {
        storedKey = crypto.randomUUID();
        localStorage.setItem("hashKey", storedKey);
      }
      setHashKey(storedKey);

      // Retrieve and decrypt stored API keys
      const storedState = localStorage.getItem("tailflareState");
      if (storedState) {
        try {
          const parsedState = JSON.parse(storedState);

          const decryptedCloudflareApiKey = parsedState.cloudflareApiKey
            ? await decryptData(parsedState.cloudflareApiKey, storedKey)
            : "";
          const decryptedTailscaleApiKey = parsedState.tailscaleApiKey
            ? await decryptData(parsedState.tailscaleApiKey, storedKey)
            : "";

          setTailflareState({
            cloudflareApiEmail: parsedState.cloudflareApiEmail || "",
            cloudflareApiKey: decryptedCloudflareApiKey || "",
            tailnetOrganization: parsedState.tailnetOrganization || "",
            tailscaleApiKey: decryptedTailscaleApiKey || "",
          });
        } catch (error) {
          console.error("Error parsing stored state:", error);
        }
      }
    }

    retrieveAndDecryptState();
  }, []);

  async function handleSave() {
    if (!hashKey) {
      alert("No hash key found. Please refresh the page.");
      return;
    }

    if (!tailflareState.cloudflareApiKey || !tailflareState.tailscaleApiKey) {
      alert("Please enter valid API keys before saving.");
      return;
    }

    try {
      const encryptedCloudflareApiKey = await encryptData(
        tailflareState.cloudflareApiKey,
        hashKey
      );
      const encryptedTailscaleApiKey = await encryptData(
        tailflareState.tailscaleApiKey,
        hashKey
      );

      const encryptedState = {
        cloudflareApiEmail: tailflareState.cloudflareApiEmail,
        cloudflareApiKey: encryptedCloudflareApiKey,
        tailnetOrganization: tailflareState.tailnetOrganization,
        tailscaleApiKey: encryptedTailscaleApiKey,
      };

      localStorage.setItem("tailflareState", JSON.stringify(encryptedState));

      alert("API secrets saved securely.");
    } catch (error) {
      console.error("Error encrypting API keys:", error);
      alert("An error occurred while saving API keys.");
    }
  }

  async function handleFetchCloudflare() {
    const response = await getCloudflareZones(tailflareState);
    const zones = response.map((zone) => ({
      id: zone.id,
      name: zone.name,
    }));
    setInformation({
      ...information,
      cloudflare: {
        zones,
      },
    });
  }

  return (
    <div className="gap-4 grid mx-auto p-4 container">
      <Dialog>
        <DialogTrigger asChild>
          <Button>Add API Secrets</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Edit API Secrets</DialogTitle>
            <DialogDescription>{`Make changes to the API secrets required to call the service's endpoints`}</DialogDescription>
          </DialogHeader>
          <KeyEntryForm
            showSecrets={showSecrets}
            tailflareState={tailflareState}
            setTailflareState={setTailflareState}
          />
          <DialogFooter>
            <Button
              onClick={() => setShowSecrets(!showSecrets)}
              variant={"ghost"}
            >
              {showSecrets ? (
                <>
                  <EyeClosed />
                  <span>Hide</span>
                </>
              ) : (
                <>
                  <Eye />
                  <span>Show</span>
                </>
              )}{" "}
              entered secrets
            </Button>
            <Button onClick={handleSave} variant={"affirmative"}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <DataNotice />
      <HostsList
        information={information}
        handleFetchCloudflare={handleFetchCloudflare}
      />
    </div>
  );
}
