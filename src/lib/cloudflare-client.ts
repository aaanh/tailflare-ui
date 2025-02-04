import { TailflareState } from "./schema-type";
import Cloudflare from "cloudflare";

const clientCache = new Map<string, Cloudflare>();

export function getCloudflareClient(
  tailflareState: TailflareState
): Cloudflare {
  const cacheKey = `${tailflareState.cloudflareApiEmail}:${tailflareState.cloudflareApiKey}`;

  if (!clientCache.has(cacheKey)) {
    clientCache.set(
      cacheKey,
      new Cloudflare({
        apiEmail: tailflareState.cloudflareApiEmail,
        apiKey: tailflareState.cloudflareApiKey,
      })
    );
  }

  return clientCache.get(cacheKey)!;
}
