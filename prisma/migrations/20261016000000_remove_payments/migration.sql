-- Remove Paystack payment integration: drop the payments table
-- (indexes and the FK to contact_inquiries are dropped with the table)
DROP TABLE IF EXISTS "payments";
