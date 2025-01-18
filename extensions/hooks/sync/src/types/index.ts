export interface SyncMetadata extends Record<string, unknown> {
    lastSyncedAt: string;
    syncSource: 'directus' | 'medusa';
    syncId: string;
}

export interface medusaProductType {
    title: string;
    description: string;
    handle: string;
    options:Array<{
        title:string,
        values:Array<string>
    }>,
    metadata: Record<string, unknown>
  }