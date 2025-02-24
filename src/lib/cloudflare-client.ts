import { Credentials } from "./schema-type";
import Cloudflare from "cloudflare";

const clientCache = new Map<string, Cloudflare>();

export function getCloudflareClient(credentials: Credentials): Cloudflare {
  const cacheKey = `${credentials.cloudflareApiEmail}:${credentials.cloudflareApiKey}`;

  if (!clientCache.has(cacheKey)) {
    clientCache.set(
      cacheKey,
      new Cloudflare({
        apiEmail: credentials.cloudflareApiEmail,
        apiKey: credentials.cloudflareApiKey,
      })
    );
  }

  return clientCache.get(cacheKey)!;
}
