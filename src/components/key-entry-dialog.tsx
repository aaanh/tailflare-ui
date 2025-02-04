"use client";

import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Information, TailflareState } from "@/lib/schema-type";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { EyeClosed, Eye, CheckCircle2, XCircle, LockKeyholeIcon } from "lucide-react";
import { Button } from "./ui/button";
import { getCloudflareZones } from "@/app/actions";
import { decryptData, encryptData } from "@/lib/utils";
import { useTailflare } from "@/contexts/tailflare-context";
import { initializeStoredState } from "@/hooks/initialize-stored-state";
import { useToast } from "@/hooks/use-toast";

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

function KeyEntryForm({
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
    <>
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

    </>
  );
}

export default function KeyEntryDialog() {
  const [showSecrets, setShowSecrets] = useState(false);
  const { tailflareState, setTailflareState, information, setInformation } = useTailflare();
  const hashKey = useInitializeHashKey();

  const { toast } = useToast();

  useEffect(() => {
    initializeStoredState(hashKey, setTailflareState);
  }, [hashKey]);

  async function handleSave() {
    if (!hashKey) {
      throw new Error("No hash key found. Please refresh the page.");
    }

    // Validate all required fields
    const requiredFields = {
      'Cloudflare API Key': tailflareState.cloudflareApiKey,
      'Tailscale API Key': tailflareState.tailscaleApiKey,
      'Cloudflare API Email': tailflareState.cloudflareApiEmail,
      'Tailnet Organization': tailflareState.tailnetOrganization,
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      throw new Error(`Please fill in all required fields: ${missingFields.join(', ')}`);
    }

    try {
      const encryptedState = {
        cloudflareApiEmail: tailflareState.cloudflareApiEmail,
        cloudflareApiKey: await encryptData(tailflareState.cloudflareApiKey, hashKey),
        tailnetOrganization: tailflareState.tailnetOrganization,
        tailscaleApiKey: await encryptData(tailflareState.tailscaleApiKey, hashKey),
      };

      localStorage.setItem("tailflareState", JSON.stringify(encryptedState));
      return true; // Indicate successful save
    } catch (error) {
      console.error("Error saving API keys:", error);
      throw new Error("Failed to save API keys securely. Please try again.");
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button><LockKeyholeIcon />Add API Secrets</Button>
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
          <Button onClick={async () => {
            try {
              await handleSave();
              toast({
                title: "API secrets saved securely",
              })
            } catch (error) {
              toast({
                title: error instanceof Error ? error.message : "An unexpected error occurred"
              })
            }
          }} variant={"affirmative"}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ApiKeyStatus() {
  const { tailflareState } = useTailflare();

  return <div className="grid grid-cols-4 border p-2 rounded-md border-neutral-500">
    {Object.entries(fieldMap).map(([label, key]) => (
      <div key={label} className="flex items-center gap-2">
        {tailflareState[key] ? (
          <CheckCircle2 className="h-5 w-5 text-green-500" />
        ) : (
          <XCircle className="h-5 w-5 text-red-500" />
        )}
        <span className="capitalize">
          {label.replace(/-/g, ' ')}
        </span>
      </div>
    ))}
  </div>
}

function useInitializeHashKey() {
  const [hashKey, setHashKey] = useState<string | null>(null);

  useEffect(() => {
    let storedKey = localStorage.getItem("hashKey");
    if (!storedKey) {
      storedKey = crypto.randomUUID();
      localStorage.setItem("hashKey", storedKey);
    }
    setHashKey(storedKey);
  }, []);

  return hashKey;
}


