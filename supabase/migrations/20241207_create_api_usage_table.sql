
-- Create table to track API usage for rate limiting
CREATE TABLE IF NOT EXISTS public.api_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  api_name TEXT NOT NULL,
  search_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unique constraint to prevent duplicate entries per day/api
CREATE UNIQUE INDEX IF NOT EXISTS api_usage_date_api_idx ON public.api_usage (date, api_name);

-- Add RLS policy (public read/write for edge functions)
ALTER TABLE public.api_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow edge functions to manage API usage" 
  ON public.api_usage 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);
