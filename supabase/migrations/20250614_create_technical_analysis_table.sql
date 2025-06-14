
-- Create technical_analysis table
CREATE TABLE IF NOT EXISTS public.technical_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  analysis_date DATE NOT NULL,
  market_overview JSONB NOT NULL,
  technical_indicators JSONB NOT NULL,
  key_levels JSONB NOT NULL,
  chart_patterns JSONB NOT NULL,
  data_sources INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for efficient querying by date
CREATE INDEX IF NOT EXISTS idx_technical_analysis_date ON public.technical_analysis(analysis_date DESC);

-- Add RLS (though this data can be public)
ALTER TABLE public.technical_analysis ENABLE ROW LEVEL SECURITY;

-- Allow read access to all users
CREATE POLICY "Allow public read access to technical analysis" 
  ON public.technical_analysis 
  FOR SELECT 
  USING (true);
