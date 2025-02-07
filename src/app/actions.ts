"use server";

import { TailflareState } from "@/lib/schema-type";
import { getCloudflareClient } from "@/lib/cloudflare-client";
import {
  RecordCreateParams,
  RecordResponse,
} from "cloudflare/resources/dns/records.mjs";
import { getTailscaleClient } from "@/lib/tailscale-client";

export async function getCloudflareZones(tailflareState: TailflareState) {
  const cloudflareClient = getCloudflareClient(tailflareState);
  const zones = await cloudflareClient.zones.list();
  return zones.result;
}

/**
 *
 * @param tailflareState
 * @param zone_id
 * @returns {Promnise<RecordResponse[]>} records
 */
export async function getCloudflareRecordsInZone(
  tailflareState: TailflareState,
  zone_id: string
): Promise<RecordResponse[]> {
  const cloudflareClient = getCloudflareClient(tailflareState);
  const response = await cloudflareClient.dns.records.list({ zone_id });

  return response.result.filter((rec) => rec.type === "CNAME");
}

/**
 * Currently only support CNAME records.
 *
 * @param tailflareState
 * @param recordCreateParams
 * @returns {Promise<RecordResponse>} res
 */
export async function createCloudflareRecordInZone(
  tailflareState: TailflareState,
  recordCreateParams: RecordCreateParams.CNAMERecord
): Promise<RecordResponse> {
  const cloudflareClient = getCloudflareClient(tailflareState);

  const response = await cloudflareClient.dns.records.create(
    recordCreateParams
  );

  return response;
}

export async function getTailscaleHosts(tailflareState: TailflareState) {
  const client = getTailscaleClient(tailflareState);

  const response = await client.devices.list();

  return response;
}
