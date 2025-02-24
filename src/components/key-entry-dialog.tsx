"use client";

import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { fieldMap, Credentials } from "@/lib/schema-type";
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
import { EyeClosed, Eye, LockKeyholeIcon } from "lucide-react";
import { Button } from "./ui/button";

import { encryptData } from "@/lib/utils";
import { useTailflare } from "@/contexts/tailflare-context";
import { initializeStoredState } from "@/hooks/initialize-stored-state";
import { useToast } from "@/hooks/use-toast";
import {
  TooltipContent,
  TooltipTrigger,
  Tooltip,
  TooltipProvider,
} from "./ui/tooltip";
import usageText from "@/lib/usage-text";

interface KeyEntryFormProps {
  credentials: Credentials;
  setCredentials: (newState: Credentials) => void;
  showSecrets: boolean;
}

function KeyEntryForm({
  credentials,
  setCredentials,
  showSecrets,
}: KeyEntryFormProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    const stateKey = fieldMap[id];
    if (stateKey) {
      setCredentials({
        ...credentials,
        [stateKey]: value,
      });
    }
  };

  return (
    <TooltipProvider>
      <form className="gap-4 grid grid-cols-2">
        {/* Tailscale column */}
        <div className="grid">
          <div className="items-center gap-1 grid">
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Label className="text-lg" htmlFor="tailnet-organization">
                    Tailnet Organization
                  </Label>
                  <TooltipContent>
                    {usageText.credentials.tailnetOrg}
                  </TooltipContent>
                </div>
              </TooltipTrigger>
            </Tooltip>

            <Input
              value={credentials.tailnetOrganization}
              id="tailnet-organization"
              onChange={handleChange}
            />
          </div>
          <div className="items-center gap-1 grid">
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Label className="text-lg" htmlFor="tailnet-organization">
                    Tailscale API Key
                  </Label>
                  <TooltipContent>
                    {usageText.credentials.tailscaleApiKey}
                  </TooltipContent>
                </div>
              </TooltipTrigger>
            </Tooltip>
            <Input
              value={credentials.tailscaleApiKey}
              id="tailscale-api-key"
              type={showSecrets ? "text" : "password"}
              onChange={handleChange}
            />
          </div>
        </div>
        {/* Cloudflare column */}
        <div className="grid">
          <div className="items-center gap-1 grid">
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Label className="text-lg" htmlFor="tailnet-organization">
                    Cloudflare API Email
                  </Label>
                  <TooltipContent>
                    {usageText.credentials.cloudflareEmail}
                  </TooltipContent>
                </div>
              </TooltipTrigger>
            </Tooltip>
            <Input
              value={credentials.cloudflareApiEmail ?? ""}
              id="cloudflare-api-email"
              onChange={handleChange}
            />
          </div>
          <div className="items-center gap-1 grid">
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Label className="text-lg" htmlFor="tailnet-organization">
                    Cloudflare API Key
                  </Label>
                  <TooltipContent>
                    {usageText.credentials.cloudflareApiKey}
                  </TooltipContent>
                </div>
              </TooltipTrigger>
            </Tooltip>
            <Input
              value={credentials.cloudflareApiKey}
              id="cloudflare-api-key"
              type={showSecrets ? "text" : "password"}
              onChange={handleChange}
            />
          </div>
        </div>
      </form>
    </TooltipProvider>
  );
}

export default function KeyEntryDialog() {
  const [showSecrets, setShowSecrets] = useState(false);
  const { credentials, setCredentials, appData, setAppData } = useTailflare();
  const hashKey = useInitializeHashKey();

  const { toast } = useToast();

  useEffect(() => {
    initializeStoredState(hashKey, setCredentials);
  }, [hashKey, setCredentials]);

  async function handleSave() {
    if (!hashKey) {
      throw new Error("No hash key found. Please refresh the page.");
    }

    // Validate all required fields
    const requiredFields = {
      "Cloudflare API Key": credentials.cloudflareApiKey,
      "Tailscale API Key": credentials.tailscaleApiKey,
      "Cloudflare API Email": credentials.cloudflareApiEmail,
      "Tailnet Organization": credentials.tailnetOrganization,
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      throw new Error(
        `Please fill in all required fields: ${missingFields.join(", ")}`
      );
    }

    try {
      const encryptedState = {
        cloudflareApiEmail: credentials.cloudflareApiEmail,
        cloudflareApiKey: await encryptData(
          credentials.cloudflareApiKey,
          hashKey
        ),
        tailnetOrganization: credentials.tailnetOrganization,
        tailscaleApiKey: await encryptData(
          credentials.tailscaleApiKey,
          hashKey
        ),
      };

      localStorage.setItem("credentials", JSON.stringify(encryptedState));
      return true; // Indicate successful save
    } catch (error) {
      console.error("Error saving API keys:", error);
      throw new Error("Failed to save API keys securely. Please try again.");
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size={"sm"}>
          <LockKeyholeIcon />
          Add API Secrets
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Edit API Secrets</DialogTitle>
          <DialogDescription>{`Make changes to the API secrets required to call the service's endpoints`}</DialogDescription>
        </DialogHeader>
        <KeyEntryForm
          showSecrets={showSecrets}
          credentials={credentials}
          setCredentials={setCredentials}
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
          <Button
            onClick={async () => {
              try {
                await handleSave();
                toast({
                  title: "API secrets saved securely",
                });
              } catch (error) {
                toast({
                  title:
                    error instanceof Error
                      ? error.message
                      : "An unexpected error occurred",
                });
              }
            }}
            variant={"affirmative"}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
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
