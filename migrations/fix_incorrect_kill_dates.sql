-- Fix corrupted kill_history data
-- Problem: The scraper recorded all kills with the "run date" instead of the actual kill date
-- This caused 01/14 kills to be duplicated/mislabeled as 01/15 kills

-- Step 1: Identify the issue - check what we have for Yeti in Lunarian
SELECT * FROM kill_history 
WHERE boss_name = 'Yeti' AND world = 'Lunarian'
ORDER BY date DESC;

-- Based on scraper logs, these bosses were ACTUALLY killed on 01/15 in Lunarian:
-- 1. Cublarc the Plunderer (updated count)
-- 2. Midnight Panther (new kill)
-- 3. The Frog Prince (new kill)

-- Bosses that were killed on 01/14 in Lunarian (should NOT have 15/01/2026):
-- Arthom the Hunter, Bakragore, Chizzoron the Distorter, Countess Sorrow,
-- Cublarc the Plunderer, Dreadful Disruptor, Ferumbras Mortal Shell,
-- Midnight Panther, World Devourer, Yakchal, Yeti, Zulazza the Corruptor

-- Step 2: Delete the incorrect 15/01/2026 records that shouldn't exist
-- These are bosses from 01/14 that were incorrectly recorded with 01/15 date in Lunarian

DELETE FROM kill_history 
WHERE world = 'Lunarian' 
AND date = '15/01/2026'
AND boss_name NOT IN ('Cublarc the Plunderer', 'Midnight Panther', 'The Frog Prince');

-- Note: You may need to run similar queries for other worlds based on the 01/15 scraper logs.
-- Check the scraper logs for each world to see what was ACTUALLY recorded vs what's in the DB.

-- IMPORTANT: Run the SELECT first to verify what would be deleted before running DELETE.
