-- Fix messages table schema to work properly with user foreign keys

-- First check if messages_sender_id_fkey already exists
DO $$
BEGIN
    -- If the sender_id foreign key doesn't have an explicit name, drop it and recreate it
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'messages_sender_id_fkey' 
        AND table_name = 'messages'
    ) THEN
        -- The constraint exists with the expected name, no need to do anything
        RAISE NOTICE 'Constraint messages_sender_id_fkey already exists';
    ELSE
        -- Try to fix any unnamed constraints
        BEGIN
            ALTER TABLE messages
            DROP CONSTRAINT IF EXISTS messages_sender_team_id_fkey;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'No sender constraint to drop or error: %', SQLERRM;
        END;

        -- Add the constraint with proper naming
        BEGIN
            ALTER TABLE messages
            ADD CONSTRAINT messages_sender_id_fkey
            FOREIGN KEY (sender_id)
            REFERENCES users(id)
            ON DELETE SET NULL;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not add sender constraint: %', SQLERRM;
        END;
    END IF;

    -- Same for receiver_id
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'messages_receiver_id_fkey' 
        AND table_name = 'messages'
    ) THEN
        RAISE NOTICE 'Constraint messages_receiver_id_fkey already exists';
    ELSE
        -- Try to fix any unnamed constraints
        BEGIN
            ALTER TABLE messages
            DROP CONSTRAINT IF EXISTS messages_receiver_team_id_fkey;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'No receiver constraint to drop or error: %', SQLERRM;
        END;

        -- Add the constraint with proper naming
        BEGIN
            ALTER TABLE messages
            ADD CONSTRAINT messages_receiver_id_fkey
            FOREIGN KEY (receiver_id)
            REFERENCES users(id)
            ON DELETE SET NULL;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not add receiver constraint: %', SQLERRM;
        END;
    END IF;
END $$;