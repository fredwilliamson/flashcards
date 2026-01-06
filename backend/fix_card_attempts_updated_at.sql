-- Fix updated_at column to have a default value
ALTER TABLE flashcard.card_attempts 
  ALTER COLUMN updated_at SET DEFAULT now();

-- Update existing rows where updated_at is NULL (if any)
UPDATE flashcard.card_attempts 
  SET updated_at = created_at 
  WHERE updated_at IS NULL;


