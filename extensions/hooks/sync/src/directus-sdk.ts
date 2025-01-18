import { createDirectus, rest } from "@directus/sdk";

interface ProductImage {
    id: number;
    directus_files_id: string;
}

interface SyncMetadata {
	lastSyncedAt?: string;
	syncSource?: 'directus' | 'medusa';
	syncId?: string;
}

export interface ProductType {
    id: string;
    is_available: boolean;
    name: string;
    price: number;
    description: string;
    category: string;
    slug: string;
    medusa_reference_id:string;
    image?: ProductImage[];
    sku?:string;
    date_updated?:string;
    metadata:SyncMetadata;
}

interface Schema {
  products: ProductType[];
}

const directus = createDirectus<Schema>(
  process.env.NEXT_PUBLIC_DIRECTUS_URL as string || "http://localhost:8055",
).with(rest());

export default directus;
