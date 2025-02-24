import { AppData } from "./schema-type";

const CACHE_KEY = "tailflare_cache";
const CACHE_EXPIRY = 1000 * 60 * 60; // 1 hour

type CacheData = {
  timestamp: number;
  appData: AppData;
  selectedZoneCache?: {
    zone: {
      id: string;
      name: string;
    };
    records: AppData["cloudflare"]["dnsRecords"];
  };
};

export function saveToCache(appData: AppData) {
  const existingCache = localStorage.getItem(CACHE_KEY);
  const currentCache: CacheData = existingCache
    ? JSON.parse(existingCache)
    : { timestamp: Date.now(), appData };

  // If there's a selected zone, cache it with its records
  if (appData.cloudflare.selectedZone) {
    currentCache.selectedZoneCache = {
      zone: {
        id: appData.cloudflare.selectedZone.id,
        name: appData.cloudflare.selectedZone.name,
      },
      records: appData.cloudflare.dnsRecords,
    };
  }

  currentCache.timestamp = Date.now();
  currentCache.appData = appData;

  localStorage.setItem(CACHE_KEY, JSON.stringify(currentCache));
}

export function loadFromCache(): AppData | null {
  const cached = localStorage.getItem(CACHE_KEY);
  if (!cached) return null;

  const cacheData: CacheData = JSON.parse(cached);
  if (Date.now() - cacheData.timestamp > CACHE_EXPIRY) {
    localStorage.removeItem(CACHE_KEY);
    return null;
  }

  // Restore selected zone and its records if they exist
  if (cacheData.selectedZoneCache) {
    cacheData.appData.cloudflare.selectedZone =
      cacheData.selectedZoneCache.zone;
    cacheData.appData.cloudflare.dnsRecords =
      cacheData.selectedZoneCache.records;
  }

  return cacheData.appData;
}
