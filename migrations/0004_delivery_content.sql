-- 0004_delivery_content.sql
-- Store encrypted fulfillment content so auto and manual delivery share one record.

ALTER TABLE deliveries ADD COLUMN encrypted_content TEXT;
ALTER TABLE deliveries ADD COLUMN status TEXT NOT NULL DEFAULT 'sent';
ALTER TABLE deliveries ADD COLUMN failure_reason TEXT;
