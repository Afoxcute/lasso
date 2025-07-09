-- Add storage_provider column to organization_admins table
ALTER TABLE "organization_admins" ADD COLUMN "storage_provider" TEXT DEFAULT 'pinata';
 
-- Update existing records to use 'pinata' as default
UPDATE "organization_admins" SET "storage_provider" = 'pinata' WHERE "storage_provider" IS NULL; 