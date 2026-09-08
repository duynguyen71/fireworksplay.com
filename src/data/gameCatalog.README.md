# Fireworks Play catalog

Snapshot from `/Users/duynguyen/RiderProjects/fireworkbuilder/Firework/Assets`, imported on 2026-09-06. The project uses application ID `com.bluedot.fireworks`.

- Category mapping follows `_SingleplayerMode/Script/FPStoreController.cs` (`LoadFireworksList`).
- Regular effects come from `Resources/Fireworks/*.prefab`. `None` and `#Testing` are excluded. The game Shells tab includes all regular effect families.
- Additional entries come from `_SingleplayerMode/PrefabList/FP Firework Prefab List.asset`, `FP Firecracker Prefab List.asset`, `FP Customizable Cake Prefab List.asset`, and `FP Reloadable Rack Prefab List.asset`.
- Names use `Firework.fullName`; Fireworks and Firecrackers use `friendlyName` when provided, matching `GetDisplayName()`.
- Thumbnail references resolve through `spriteThumb` GUIDs and Unity `.meta` files. All imported sprites use single-sprite mode. Web thumbnails are resized to 256px wide and encoded as WebP in `public/images/catalog/`.
- Racks includes the game's firing tools and tubes, as listed in the same store tab. Props, explosives, rewards, and seasonal lists are outside these two website categories.
- `gameCatalog.json` is static website data. Update it and the copied thumbnails when the game catalog changes. Website builds do not require Unity or access to the game checkout.
- The All view deduplicates IDs because effects can appear in several in-game categories.
