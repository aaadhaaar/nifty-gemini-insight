
-- 1. Remove all dummy/fallback articles from news_articles table
DELETE FROM public.news_articles
WHERE title = 'Indian Market Intelligence Update'
   OR source IN (
        'Indian Market AI Engine',
        'Market Intelligence Engine',
        'Market Intelligence'
    )
   OR (
       content LIKE '%Indian market intelligence system analyzing Nifty, Sensex movements%'
       AND summary LIKE '%Strategic positioning opportunities identified across Indian equity sectors%'
   );

-- 2. Add CHECK constraint to block known-dummy titles
ALTER TABLE public.news_articles
ADD CONSTRAINT ck_no_dummy_titles
CHECK (title NOT IN ('Indian Market Intelligence Update'));

-- 3. Add CHECK constraint to block known-dummy sources
ALTER TABLE public.news_articles
ADD CONSTRAINT ck_no_dummy_sources
CHECK (
    source IS NULL
    OR source NOT IN ('Indian Market AI Engine', 'Market Intelligence Engine', 'Market Intelligence')
);

-- 4. Add trigger to prevent insertion of placeholder/fallback content
CREATE OR REPLACE FUNCTION prevent_dummy_news()
RETURNS trigger AS $$
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
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_dummy_news ON public.news_articles;
CREATE TRIGGER trg_prevent_dummy_news
  BEFORE INSERT OR UPDATE ON public.news_articles
  FOR EACH ROW EXECUTE FUNCTION prevent_dummy_news();
