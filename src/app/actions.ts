"use server";

import { TailflareState } from "@/lib/schema-type";
import Cloudflare from "cloudflare";

export async function getCloudflareZones(tailflareState: TailflareState) {
  const cloudflareClient = new Cloudflare({
    apiEmail: tailflareState.cloudflareApiEmail,
    apiKey: tailflareState.cloudflareApiKey,
  });
  const zones = await cloudflareClient.zones.list();

  return zones.result;
}
