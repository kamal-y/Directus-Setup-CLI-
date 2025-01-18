import { SyncMetadata } from "../types";

export  const generateSyncMetadata = (source: 'directus' | 'medusa'): SyncMetadata => ({
    lastSyncedAt: new Date().toISOString(),
    syncSource: source,
    syncId: Math.random().toString(36).substring(7)
});
