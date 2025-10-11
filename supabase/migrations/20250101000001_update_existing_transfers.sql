-- Fix Transfer Transaction Logic - Part 2: Update existing transfer transactions
-- This migration updates existing transfer transactions to use the new 'transfer' type

-- 1. Update existing transfer transactions (those with both from_account_id and to_account_id)
-- These are currently stored as 'income' but should be 'transfer'
UPDATE transactions 
SET type = 'transfer'
WHERE from_account_id IS NOT NULL 
  AND to_account_id IS NOT NULL
  AND from_account_id != to_account_id;

-- 2. Update categories that were created for transfers but have wrong type
-- Find categories named 'Account Transfer' and update their type to 'transfer'
UPDATE categories 
SET type = 'transfer'
WHERE name = 'Account Transfer' 
  AND type = 'income';
