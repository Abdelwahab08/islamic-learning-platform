-- Add group_id column to materials table
ALTER TABLE materials ADD COLUMN group_id CHAR(36) NULL;
ALTER TABLE materials ADD FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE SET NULL;
ALTER TABLE materials ADD INDEX idx_group (group_id);

-- Make stage_id nullable since it's not always required
ALTER TABLE materials MODIFY COLUMN stage_id CHAR(36) NULL;
