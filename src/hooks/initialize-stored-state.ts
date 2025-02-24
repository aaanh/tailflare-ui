import { Credentials } from "@/lib/schema-type";
import { decryptData } from "@/lib/utils";

export async function initializeStoredState(
  hashKey: string | null,
  setCredentials: (state: Credentials) => void
) {
  if (!hashKey) return;

  const storedState = localStorage.getItem("credentials");
  if (!storedState) return;

  try {
    const parsedState = JSON.parse(storedState);

    const decryptedCloudflareApiKey = parsedState.cloudflareApiKey
      ? await decryptData(parsedState.cloudflareApiKey, hashKey)
      : "";
    const decryptedTailscaleApiKey = parsedState.tailscaleApiKey
      ? await decryptData(parsedState.tailscaleApiKey, hashKey)
      : "";

    setCredentials({
      cloudflareApiEmail: parsedState.cloudflareApiEmail || "",
      cloudflareApiKey: decryptedCloudflareApiKey || "",
      tailnetOrganization: parsedState.tailnetOrganization || "",
      tailscaleApiKey: decryptedTailscaleApiKey || "",
    });
  } catch (error) {
    console.error("Error parsing stored state:", error);
  }
}
