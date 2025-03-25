"use server";

import { AppData, Credentials } from "@/lib/schema-type";
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

export async function getCloudflareZones(credentials: Credentials) {
  const cloudflareClient = getCloudflareClient(credentials);
  const zones = await cloudflareClient.zones.list();
  return zones.result;
}

/**
 *
 * @param credentials
 * @param zone_id
 * @returns {Promnise<RecordResponse[]>} records
 */
export async function getCloudflareRecordsInZone(
  credentials: Credentials,
  zone_id: string
): Promise<RecordResponse[]> {
  const cloudflareClient = getCloudflareClient(credentials);
  const response = await cloudflareClient.dns.records.list({ zone_id });

  return response.result.filter((rec) => rec.type === "CNAME");
}

/**
 * Currently only support CNAME records.
 *
 * @param credentials
 * @param recordCreateParams
 * @returns {Promise<RecordResponse>} res
 */
export async function createCloudflareRecordInZone(
  credentials: Credentials,
  recordCreateParams: RecordCreateParams.CNAMERecord
): Promise<RecordResponse> {
  const cloudflareClient = getCloudflareClient(credentials);

  const response = await cloudflareClient.dns.records.create(
    recordCreateParams
  );

  return response;
}

export async function getTailscaleHosts(credentials: Credentials) {
  const client = getTailscaleClient(credentials);

  const response = await client.devices.list();

  return response;
}

export async function deleteRecordByIdFromCloudflare(
  credentials: Credentials,
  dnsRecordId: string,
  recordDeleteParams: RecordDeleteParams
): Promise<RecordDeleteResponse> {
  const cloudflareClient = getCloudflareClient(credentials);
  const response = await cloudflareClient.dns.records.delete(
    dnsRecordId,
    recordDeleteParams
  );

  return response;
}

export async function createMultipleRecordsInCloudflareZone(
  recordCreateParams: RecordCreateParams.CNAMERecord[],
  credentials: Credentials,
  appData: AppData
) {
  const cloudflareClient = getCloudflareClient(credentials);

  if (appData.cloudflare.selectedZone?.id) {
    const response = await cloudflareClient.dns.records.batch({
      posts: recordCreateParams,
      zone_id: appData.cloudflare.selectedZone.id,
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
  credentials: Credentials,
  appData: AppData
) {
  const cloudflareClient = getCloudflareClient(credentials);

  if (appData.cloudflare.selectedZone?.id) {
    const response = await cloudflareClient.dns.records.batch({
      deletes: recordDeleteParams,
      zone_id: appData.cloudflare.selectedZone.id,
    });

    return response;
  } else {
    throw new Error(
      "Unable to perform batch action: Add all hosts to Cloudflare."
    );
  }
}

export async function UpdateMultipleRecordsInCloudflareZone(
  batchPatchParams: BatchPatchParam.CNAME[],
  credentials: Credentials,
  appData: AppData
) {
  if (!appData.cloudflare.selectedZone?.id) {
    throw new Error(
      "Unable to perform batch action: Select a Cloudflare zone first."
    );
  }

  const client = getCloudflareClient(credentials);
  const response = await client.dns.records.batch({
    patches: batchPatchParams,
    zone_id: appData.cloudflare.selectedZone.id,
  });
}
