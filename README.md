# Directus Project with Medusa Integration

This project uses **Directus** as a headless CMS, integrated with **Medusa.js** for e-commerce functionalities. Synchronization between Directus and Medusa is achieved using **Directus Hooks API**, with custom logic to handle data sync while preventing infinite loops.

---

## Features

- **Directus Hooks API** for event-driven synchronization.
- Integration with **Medusa.js** for e-commerce backend management.
- Infinite loop management with custom sync metadata generation.
- Fully extensible and customizable for additional use cases.

---

## Prerequisites

Ensure the following are installed:

- [Node.js](https://nodejs.org/) (v16 or above)
- [Directus CLI](https://docs.directus.io/getting-started/cli.html)
- A running [Medusa backend](https://docs.medusajs.com/quickstart)

---

## Environment Variables

Create a `.env` file in the root directory and add the following variables:

```env
# Directus Environment Variables
NEXT_PUBLIC_DIRECTUS_URL = "http://localhost:8055"

# Medusa Secret API Key
MEDUSA_SECRET_API = "sk_6fc351fc0e363437e8f78fd500cd12655a2fdfa6f60bff27c50a33e9241035b7"
```

---

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/mavvoc-new.git
   ```

2. Navigate to the project directory:
   ```bash
   cd mavvoc-new
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Bootstrap the Directus project:
   ```bash
   npm run pre
   ```

5. Start the Directus server:
   ```bash
   npm start
   ```

---

## Synchronization Logic

Synchronization between Directus and Medusa is achieved using the following:

### Infinite Loop Management

The `generateSyncMetadata` function is used to manage metadata for synchronization:

```ts
export const generateSyncMetadata = (source: 'directus' | 'medusa'): SyncMetadata => ({
    lastSyncedAt: new Date().toISOString(),
    syncSource: source,
    syncId: Math.random().toString(36).substring(7)
});
```

To avoid infinite sync loops, the `isExternalSync` function checks the sync source and timestamp:

```ts
const isExternalSync = async (productId: string): Promise<boolean> => {
    try {
        const product = await directus.request(readItem("products", productId));
        const metadata = product?.metadata as SyncMetadata;

        if (!metadata?.lastSyncedAt) return false;

        const timeDiff = Date.now() - new Date(metadata.lastSyncedAt).getTime();

        console.log('DIRECTUS SIDE TIME', timeDiff);

        return metadata?.syncSource === 'medusa' && timeDiff < SYNC_THRESHOLD;
    } catch (error) {
        console.error("[Directus] Error checking external sync:", error);
        return false;
    }
};
```

### Custom Hook Directory

The custom hook for synchronization is located at:

```
directus/extensions/hooks/sync
```

This hook leverages the Directus Hooks API to synchronize data:

```js
export default ({ filter, action }) => {
    // Example: Trigger before an item is created in Directus
    filter('items.create', async (input) => {
        console.log('Before creating item:', input);
        return input;
    });

    // Example: Trigger after an item is created in Directus
    action('items.create', async ({ payload }) => {
        console.log('Item created:', payload);
    });
};
```

---

## Scripts

- **`npm start`**: Starts the Directus server.
- **`npm run pre`**: Bootstraps the Directus project.
- **`npm run restore`**: Restores the schema from a snapshot.
- **`npm run backup`**: Creates a snapshot of the current schema.

---

## Folder Structure

```
mavvoc-new/
├── directus/                         # Directus project files
│   ├── extensions/                   # Custom extensions
│   │   └── hooks/                    # Hooks for synchronization
│   │       └── sync/                 # Custom sync logic
├── .env                              # Environment variables
├── package.json                      # Project metadata and dependencies
└── README.md                         # Project documentation
```

---

## Dependencies

### Core Dependencies

- **@directus/extensions-sdk**: SDK for building Directus extensions.
- **@directus/sdk**: SDK for interacting with Directus API.
- **@medusajs/js-sdk**: Medusa SDK for interacting with the Medusa backend.
- **axios**: HTTP client for making API requests.

---

## Custom API Hooks

### Directus Hooks API

The project uses the **Directus Hooks API** to listen to events and synchronize data between Directus and Medusa. Custom logic can be defined using event listeners for:

1. **Filter Events**: Modify or cancel an event before it occurs.
2. **Action Events**: Perform custom logic after an event has occurred.

Example:

```js
export default ({ filter, action }) => {
    filter('items.update', async (input) => {
        console.log('Before updating item:', input);
        return input;
    });

    action('items.update', async ({ payload }) => {
        console.log('Item updated:', payload);
    });
};
```

---

## License

This project is licensed under the [MIT License](LICENSE).

---

## Contact

For questions or support, please contact [your-email@example.com].

