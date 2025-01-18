import { defineHook } from '@directus/extensions-sdk';
import { MedusaSdk } from './medusa-sdk';
import { readItem, updateItem } from '@directus/sdk';
import directus from './directus-sdk';
import { medusaProductType, SyncMetadata } from './types';
import { generateSyncMetadata } from './utils';

export default defineHook(async ({ filter, action }) => {
    const SYNC_THRESHOLD = 10000; //threshold time for better loop handling

    const isExternalSync = async (productId: string): Promise<boolean> => {
        try {
            const product = await directus.request(readItem("products", productId));
            const metadata = product?.metadata as SyncMetadata;
            
            if (!metadata?.lastSyncedAt) return false;
            
            const timeDiff = Date.now() - new Date(metadata.lastSyncedAt).getTime();

            console.log('DIRECTUS SIDE TIME',timeDiff);
                        
            return metadata?.syncSource === 'medusa' && timeDiff < SYNC_THRESHOLD;
        } catch (error) {
            console.error("[Directus] Error checking external sync:", error);
            return false;
        }
    };

    //CREATE PRODUCT SYNC LOGIC
    filter('products.items.create', (meta: any) => {
        console.log('Creating Item!');
        return meta;
    });

    action('products.items.create', async (meta) => {
        try {
            // Check if this is a sync from Medusa
            if (await isExternalSync(meta.key)) {
                console.log('[Directus] Skipping create - product synced from Medusa');
                return;
            }

            const directusProduct = meta.payload;
            const syncMetadata = generateSyncMetadata('directus');

            const MedusaSyncProductData:medusaProductType = {
                title: directusProduct?.name ,
                description: directusProduct?.description ,
                handle: directusProduct?.slug,
                options: [{ title: 'Default Option', values: ['opt 1', 'opt 2','opt 3'] }],
                metadata: syncMetadata
            };

            const { product: medusaProduct } = await MedusaSdk.admin.product.create(MedusaSyncProductData);
            await directus.request(updateItem("products", meta.key, { 
                medusa_reference_id: medusaProduct.id,
                metadata: syncMetadata 
            }));
        } catch (error: any) {
            console.error("Error creating product:", error.response?.data || error);
        }
    });

    //UPDATE PRODUCT SYNC LOGIC
    filter('products.items.update', (meta: any) => {
        console.log('Creating Item!');
        return meta;
    });

    action("products.items.update", async (meta) => {
        try {
            // Check if this is a sync from Medusa
            if (await isExternalSync(meta.keys[0])) {
                console.log('[Directus] Skipping update - product synced from Medusa');
                return;
            }

            // Fetch the product from Directus
            const productId = meta.keys[0];
            const directusProduct = await directus.request(readItem("products", productId));

            if (!directusProduct?.medusa_reference_id) {
                console.log(`[ERROR] Product with ID ${meta.payload.id} not found or missing Medusa reference ID.`);
                return;
            }

            const syncMetadata = generateSyncMetadata('directus');

            const updatePayload = {
                title: directusProduct.name,
                description: directusProduct.description,
                handle: directusProduct.slug,
                metadata: syncMetadata
            };

            // Update the product in Medusa
            await MedusaSdk.admin.product.update(directusProduct.medusa_reference_id, updatePayload);
            
            // Update Directus metadata
            await directus.request(updateItem("products", productId, { 
                metadata: syncMetadata 
            }));
            
            console.log(`[SUCCESS] Product with ID ${meta.payload.id} updated in Medusa.`);
        } catch (error) {
            console.error("[ERROR] Failed to update product in Medusa:", error);
        }
    });

    // DELETE SYNCHRONIZATION LOGIC  
    let medusa_reference_id: string;

    filter('products.items.delete', async (payload: string[]) => {
        try {
            // Fetch the product data before deletion
            const productId: string = payload[0] || '';

            const directusProduct = await directus.request(readItem("products", productId));

            medusa_reference_id = directusProduct.medusa_reference_id;
        } catch (error) {
            console.log("[filter] Error fetching product data before delete:", error);
        }
        return payload;
    });

    action("products.items.delete", async () => {
        try {
            await MedusaSdk.admin.product.delete(medusa_reference_id);
        } catch (error) {
            console.log("[success] Error deleting product in Medusa:", error);
        }
    });
});