-- =============================================================
-- Removes everything added by seed_2000_assets.sql.
--
-- The seeded assets were originally tagged with 'SEED-' property
-- numbers for identification, then renamed to the app's real
-- 'COA-YEAR-###' format (see rename_seed_property_numbers.sql), so
-- they're no longer distinguishable by property_number pattern.
-- Instead this relies on the `seed_batch_assets` marker table, which
-- was populated with the batch's asset_ids before the rename.
--
-- disposal_ledger.fk_dl_asset is ON DELETE RESTRICT (not CASCADE),
-- so child rows must be deleted explicitly before the parent assets.
-- asset_history / maintenance_ledger are CASCADE but are deleted
-- explicitly too, for clarity and to avoid relying on FK behavior.
--
-- Run against whichever database you loaded the seed into:
--   mysql -u root gso_inventory < cleanup_seed_2000_assets.sql
-- =============================================================

DELETE dl FROM disposal_ledger dl
  JOIN seed_batch_assets s ON dl.asset_id = s.asset_id;

DELETE ml FROM maintenance_ledger ml
  JOIN seed_batch_assets s ON ml.asset_id = s.asset_id;

DELETE ah FROM asset_history ah
  JOIN seed_batch_assets s ON ah.asset_id = s.asset_id;

DELETE a FROM assets a
  JOIN seed_batch_assets s ON a.asset_id = s.asset_id;

DROP TABLE IF EXISTS seed_batch_assets;

-- Note: the 5 extra categories the seed script added (Heavy Equipment,
-- Communication Equipment, Medical Equipment, Agricultural Equipment,
-- Security Equipment) are left in place since other data may reference
-- them by the time you run this. Drop them manually if truly unused:
--   DELETE FROM categories WHERE category_name IN
--     ('Heavy Equipment','Communication Equipment','Medical Equipment',
--      'Agricultural Equipment','Security Equipment')
--     AND category_id NOT IN (SELECT DISTINCT category_id FROM assets);
