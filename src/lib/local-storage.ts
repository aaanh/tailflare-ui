import { Information } from "./schema-type";

const CACHE_KEY = "tailflare_cache";
const CACHE_EXPIRY = 1000 * 60 * 60; // 1 hour

type CacheData = {
  timestamp: number;
  information: Information;
  selectedZoneCache?: {
    zoneId: string;
    records: Information["cloudflare"]["dnsRecords"];
  };
};

export function saveToCache(information: Information) {
  const existingCache = localStorage.getItem(CACHE_KEY);
  const currentCache: CacheData = existingCache
    ? JSON.parse(existingCache)
    : { timestamp: Date.now(), information };

  // If there's a selected zone, cache it with its records
  if (information.cloudflare.selectedZone) {
    currentCache.selectedZoneCache = {
      zoneId: information.cloudflare.selectedZone,
      records: information.cloudflare.dnsRecords,
    };
  }

  currentCache.timestamp = Date.now();
  currentCache.information = information;

  localStorage.setItem(CACHE_KEY, JSON.stringify(currentCache));
}

export function loadFromCache(): Information | null {
  const cached = localStorage.getItem(CACHE_KEY);
  if (!cached) return null;

  const cacheData: CacheData = JSON.parse(cached);
  if (Date.now() - cacheData.timestamp > CACHE_EXPIRY) {
    localStorage.removeItem(CACHE_KEY);
    return null;
  }

  // Restore selected zone and its records if they exist
  if (cacheData.selectedZoneCache) {
    cacheData.information.cloudflare.selectedZone =
      cacheData.selectedZoneCache.zoneId;
    cacheData.information.cloudflare.dnsRecords =
      cacheData.selectedZoneCache.records;
  }

  return cacheData.information;
}
