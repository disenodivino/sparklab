-- Results and Settings Table
-- Stores event results configuration and winners

CREATE TABLE IF NOT EXISTS public.event_settings (
  id integer PRIMARY KEY DEFAULT 1,
  results_visible boolean DEFAULT false,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT single_row_check CHECK (id = 1)
);

CREATE TABLE IF NOT EXISTS public.results (
  id bigserial PRIMARY KEY,
  category varchar NOT NULL UNIQUE, -- 'champion', 'runner_up', 'third_place', 'best_womens_team', 'most_innovative', 'peoples_choice', 'special_recognition'
  team_id integer REFERENCES public.teams(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Insert default settings row
INSERT INTO public.event_settings (id, results_visible) 
VALUES (1, false)
ON CONFLICT (id) DO NOTHING;

-- Insert default result categories
INSERT INTO public.results (category) VALUES
  ('champion'),
  ('runner_up'),
  ('third_place'),
  ('best_womens_team'),
  ('most_innovative'),
  ('peoples_choice'),
  ('special_recognition')
ON CONFLICT (category) DO NOTHING;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_results_category ON public.results(category);
CREATE INDEX IF NOT EXISTS idx_results_team_id ON public.results(team_id);
