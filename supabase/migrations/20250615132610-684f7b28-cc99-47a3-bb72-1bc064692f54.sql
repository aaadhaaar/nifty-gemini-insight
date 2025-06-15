
-- Replace prevent_dummy_news with explicit search_path for security
CREATE OR REPLACE FUNCTION public.prevent_dummy_news()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  IF NEW.title = 'Indian Market Intelligence Update'
     OR NEW.source IN ('Indian Market AI Engine', 'Market Intelligence Engine', 'Market Intelligence')
     OR (NEW.content IS NOT NULL AND POSITION('Indian market intelligence system analyzing Nifty, Sensex movements' IN NEW.content) > 0
         AND NEW.summary IS NOT NULL AND POSITION('Strategic positioning opportunities identified across Indian equity sectors' IN NEW.summary) > 0)
  THEN
    RAISE EXCEPTION 'Dummy news articles are not allowed';
  END IF;
  RETURN NEW;
END;
$$;
