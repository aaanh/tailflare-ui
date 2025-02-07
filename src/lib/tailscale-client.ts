import { TailflareState } from "./schema-type";

const clientCache = new Map<string, Tailscale>();

type InitializeTailscaleParams = {
  tailnet: string;
  apiKey: string;
};

export class Tailscale {
  #tailnet: string;
  #apiKey: string;

  constructor({ tailnet, apiKey }: InitializeTailscaleParams) {
    this.#tailnet = tailnet;
    this.#apiKey = apiKey;
  }

  devices = {
    list: async () => {
      try {
        const response = await fetch(
          `https://api.tailscale.com/api/v2/tailnet/${this.#tailnet}/devices`,
          {
            headers: {
              Authorization: `Bearer ${this.#apiKey}`,
            },
          }
        );
        return response.json();
      } catch {
        throw new Error("Unable to fetch Tailnet devices.");
      }
    },
  };
}

export function getTailscaleClient(tailflareState: TailflareState): Tailscale {
  const cacheKey = `${tailflareState.tailnetOrganization}:${tailflareState.tailscaleApiKey}`;

  if (!clientCache.has(cacheKey)) {
    clientCache.set(
      cacheKey,
      new Tailscale({
        tailnet: tailflareState.tailnetOrganization,
        apiKey: tailflareState.tailscaleApiKey,
      })
    );
  }

  return clientCache.get(cacheKey)!;
}
