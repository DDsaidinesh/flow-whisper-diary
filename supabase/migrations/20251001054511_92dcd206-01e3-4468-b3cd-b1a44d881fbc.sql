-- Fix security warning: Update migrate_local_storage_data function to have secure search_path
CREATE OR REPLACE FUNCTION public.migrate_local_storage_data(p_user_id uuid, p_transactions jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_transaction JSONB;
  v_category_id UUID;
  v_migrated_count INT := 0;
  v_errors JSONB := '[]'::JSONB;
  v_result JSONB;
BEGIN
  -- Loop through each transaction
  FOR v_transaction IN SELECT * FROM jsonb_array_elements(p_transactions)
  LOOP
    BEGIN
      -- Find or create category
      SELECT id INTO v_category_id
      FROM public.categories
      WHERE name = v_transaction->>'category'
        AND type = v_transaction->>'type'
        AND (is_default = true OR user_id = p_user_id)
      LIMIT 1;
      
      -- If category doesn't exist, create it
      IF v_category_id IS NULL THEN
        INSERT INTO public.categories (name, type, user_id, is_default)
        VALUES (
          v_transaction->>'category',
          v_transaction->>'type',
          p_user_id,
          false
        )
        RETURNING id INTO v_category_id;
      END IF;
      
      -- Insert transaction
      INSERT INTO public.transactions (
        user_id,
        amount,
        description,
        category_id,
        type,
        date,
        created_at
      ) VALUES (
        p_user_id,
        (v_transaction->>'amount')::NUMERIC,
        v_transaction->>'description',
        v_category_id,
        v_transaction->>'type',
        (v_transaction->>'date')::DATE,
        COALESCE((v_transaction->>'created_at')::TIMESTAMP WITH TIME ZONE, now())
      );
      
      v_migrated_count := v_migrated_count + 1;
      
    EXCEPTION WHEN OTHERS THEN
      v_errors := v_errors || jsonb_build_object(
        'transaction', v_transaction,
        'error', SQLERRM
      );
    END;
  END LOOP;
  
  -- Build result
  v_result := jsonb_build_object(
    'success', true,
    'migrated_count', v_migrated_count,
    'errors', v_errors
  );
  
  RETURN v_result;
END;
$function$;