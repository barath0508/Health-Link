-- Food Allergy and Nutrition Tables

-- User food allergies and dietary restrictions
CREATE TABLE IF NOT EXISTS user_allergies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  allergen_name text NOT NULL,
  severity text CHECK (severity IN ('mild', 'moderate', 'severe', 'life_threatening')),
  symptoms text[],
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Nutrition analysis history
CREATE TABLE IF NOT EXISTS nutrition_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  food_item text NOT NULL,
  image_url text,
  analysis_result jsonb,
  allergy_warnings text[],
  nutrition_score numeric,
  recommendations text[],
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_allergies ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_analyses ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their allergies" ON user_allergies FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users can view their nutrition analyses" ON nutrition_analyses FOR ALL USING (user_id = auth.uid());

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_allergies_user ON user_allergies(user_id);
CREATE INDEX IF NOT EXISTS idx_nutrition_analyses_user ON nutrition_analyses(user_id);