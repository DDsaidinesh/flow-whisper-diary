-- Fix Transfer Transaction Logic - Part 1: Add 'transfer' enum value
-- This migration adds 'transfer' type to transaction_type enum

-- Add 'transfer' to the transaction_type enum
ALTER TYPE transaction_type ADD VALUE IF NOT EXISTS 'transfer';

-- Note: The existing triggers (update_account_balance_on_transaction_insert/delete/update) 
-- already handle transfers correctly by detecting when both from_account_id and to_account_id are set.
-- No changes needed to the trigger functions as they already work properly.
