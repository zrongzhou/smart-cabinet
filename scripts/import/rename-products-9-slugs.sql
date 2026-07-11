-- rename-products-9-slugs.sql
-- ---------------------------------------------------------------------------
-- Rename 9 product slugs to their new canonical values.
--
-- Source of truth for the mapping: scripts/redirects.json (the 301 redirects
-- already present in next.config.mjs). This SQL mirrors that mapping so the
-- stored `products.slug` values match the new public URLs.
--
-- IMPORTANT: This file is INTENTIONALLY NOT EXECUTED by the rename tooling.
-- Run it manually against the production database ONLY after this source/code
-- rename lands and after a verified backup. Each statement uses the FULL slug
-- form (with the `applications/` or `solutions/` prefix where applicable, and
-- the `.html` suffix) to match `products.slug` exactly.
-- ---------------------------------------------------------------------------

UPDATE products SET slug = 'tool-vending-machine-cnc-tools.html' WHERE slug = 'cnc-tool-vending-machines.html';
UPDATE products SET slug = 'automated-tool-storage-system.html' WHERE slug = 'automated-storage-cabinet.html';
UPDATE products SET slug = 'applications/tool-vending-machine-cnc-tools.html' WHERE slug = 'applications/cnc-tool-vending-machine.html';
UPDATE products SET slug = 'applications/secure-document-storage-cabinet.html' WHERE slug = 'applications/smart-file-cabinet.html';
UPDATE products SET slug = 'applications/rfid-tool-tracking-cabinet.html' WHERE slug = 'applications/tool-tracking-system.html';
UPDATE products SET slug = 'applications/refrigerated-chemical-storage-cabinet.html' WHERE slug = 'applications/chemical-storage-cabinet.html';
UPDATE products SET slug = 'solutions/electronics-esd-supplies-inventory.html' WHERE slug = 'solutions/electronics-manufacturing-inventory.html';
UPDATE products SET slug = 'solutions/automotive-ev-parts-inventory.html' WHERE slug = 'solutions/automotive-manufacturing-inventory.html';
UPDATE products SET slug = 'solutions/medical-device-inventory-management.html' WHERE slug = 'solutions/medical-device-manufacturing-supplies.html';
