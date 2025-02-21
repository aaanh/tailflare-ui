"use server";

import { Information, TailflareState } from "@/lib/schema-type";
import { getCloudflareClient } from "@/lib/cloudflare-client";
import {
  BatchPatchParam,
  BatchPutParam,
  RecordBatchParams,
  RecordCreateParams,
  RecordDeleteParams,
  RecordDeleteResponse,
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

export async function deleteRecordByIdFromCloudflare(
  tailflareState: TailflareState,
  dnsRecordId: string,
  recordDeleteParams: RecordDeleteParams
): Promise<RecordDeleteResponse> {
  const cloudflareClient = getCloudflareClient(tailflareState);
  const response = await cloudflareClient.dns.records.delete(
    dnsRecordId,
    recordDeleteParams
  );

  return response;
}

export async function createMultipleRecordsInCloudflareZone(
  recordCreateParams: RecordCreateParams.CNAMERecord[],
  tailflareState: TailflareState,
  information: Information
) {
  const cloudflareClient = getCloudflareClient(tailflareState);

  if (information.cloudflare.selectedZone?.id) {
    const response = await cloudflareClient.dns.records.batch({
      posts: recordCreateParams,
      zone_id: information.cloudflare.selectedZone.id,
    });

    return response;
  } else {
    throw new Error(
      "Unable to perform batch action: Add all hosts to Cloudflare."
    );
  }
}

export async function deleteMultipleRecordsInCloudflareZone(
  recordDeleteParams: RecordBatchParams.Delete[],
  tailflareState: TailflareState,
  information: Information
) {
  const cloudflareClient = getCloudflareClient(tailflareState);

  if (information.cloudflare.selectedZone?.id) {
    const response = await cloudflareClient.dns.records.batch({
      deletes: recordDeleteParams,
      zone_id: information.cloudflare.selectedZone.id,
    });

    return response;
  } else {
    throw new Error(
      "Unable to perform batch action: Add all hosts to Cloudflare."
    );
  }
}

export async function UpdateMultipleRecordsInCloudflareZone(
  batchPatchParams: BatchPatchParam.CNAMERecord[],
  tailflareState: TailflareState,
  information: Information
) {
  if (!information.cloudflare.selectedZone?.id) {
    throw new Error(
      "Unable to perform batch action: Select a Cloudflare zone first."
    );
  }

  const client = getCloudflareClient(tailflareState);
  const response = await client.dns.records.batch({
    patches: batchPatchParams,
    zone_id: information.cloudflare.selectedZone.id,
  });
}
