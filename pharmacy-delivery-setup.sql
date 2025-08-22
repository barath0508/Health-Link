-- Medicine Home Delivery Integration Tables

-- Pharmacies/Medical Shops
CREATE TABLE IF NOT EXISTS pharmacies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  license_number text UNIQUE NOT NULL,
  phone text NOT NULL,
  email text,
  address text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  pincode text NOT NULL,
  latitude numeric,
  longitude numeric,
  is_24x7 boolean DEFAULT false,
  home_delivery boolean DEFAULT true,
  delivery_radius_km integer DEFAULT 10,
  min_order_amount numeric DEFAULT 0,
  delivery_fee numeric DEFAULT 50,
  free_delivery_above numeric DEFAULT 500,
  is_verified boolean DEFAULT false,
  rating numeric DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  total_reviews integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Medicine Orders
CREATE TABLE IF NOT EXISTS medicine_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  pharmacy_id uuid REFERENCES pharmacies(id) ON DELETE CASCADE,
  prescription_image_url text,
  delivery_address text NOT NULL,
  delivery_phone text NOT NULL,
  order_type text DEFAULT 'prescription' CHECK (order_type IN ('prescription', 'otc', 'refill')),
  total_amount numeric NOT NULL CHECK (total_amount >= 0),
  delivery_fee numeric DEFAULT 0,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled')),
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'cod', 'failed')),
  delivery_date date,
  delivery_time_slot text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Order Items
CREATE TABLE IF NOT EXISTS medicine_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES medicine_orders(id) ON DELETE CASCADE,
  medicine_name text NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price numeric NOT NULL CHECK (unit_price >= 0),
  total_price numeric NOT NULL CHECK (total_price >= 0),
  is_available boolean DEFAULT true,
  substitute_suggested text,
  created_at timestamptz DEFAULT now()
);

-- Refill Suggestions
CREATE TABLE IF NOT EXISTS refill_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  reminder_id uuid REFERENCES medicine_reminders(id) ON DELETE CASCADE,
  medicine_name text NOT NULL,
  suggested_quantity integer NOT NULL,
  days_remaining integer NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'ordered', 'dismissed')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE pharmacies ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicine_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicine_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE refill_suggestions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view verified pharmacies" ON pharmacies FOR SELECT USING (is_verified = true);
CREATE POLICY "Users can view their orders" ON medicine_orders FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create orders" ON medicine_orders FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can view their order items" ON medicine_order_items FOR SELECT USING (
  order_id IN (SELECT id FROM medicine_orders WHERE user_id = auth.uid())
);
CREATE POLICY "Users can view their refill suggestions" ON refill_suggestions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update their refill suggestions" ON refill_suggestions FOR UPDATE USING (user_id = auth.uid());

-- Indexes
CREATE INDEX IF NOT EXISTS idx_pharmacies_location ON pharmacies(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_pharmacies_city ON pharmacies(city);
CREATE INDEX IF NOT EXISTS idx_medicine_orders_user ON medicine_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_medicine_orders_status ON medicine_orders(status);
CREATE INDEX IF NOT EXISTS idx_refill_suggestions_user ON refill_suggestions(user_id);

-- Add pharmacies to emergency contacts
INSERT INTO emergency_contacts (name, category, phone_number, address, city, state, services) VALUES
('Apollo Pharmacy 24x7', 'other', '1860-500-0101', 'Multiple Locations', 'Chennai', 'Tamil Nadu', ARRAY['Medicine Delivery', '24x7 Service', 'Prescription']),
('MedPlus Pharmacy', 'other', '040-4444-5555', 'Multiple Locations', 'Hyderabad', 'Telangana', ARRAY['Medicine Delivery', 'Health Products']),
('Netmeds Pharmacy', 'other', '1800-123-1010', 'Online Delivery', 'Multiple Cities', 'All States', ARRAY['Online Medicine', 'Home Delivery']),
('PharmEasy', 'other', '1800-102-0101', 'Online Delivery', 'Multiple Cities', 'All States', ARRAY['Medicine Delivery', 'Lab Tests']);