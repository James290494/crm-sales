-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Customers policies
CREATE POLICY "Users can view their own customers" ON customers
  FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can insert their own customers" ON customers
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own customers" ON customers
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own customers" ON customers
  FOR DELETE USING (auth.uid() = created_by);

-- Products policies
CREATE POLICY "Users can view their own products" ON products
  FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can insert their own products" ON products
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own products" ON products
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own products" ON products
  FOR DELETE USING (auth.uid() = created_by);

-- Quotations policies
CREATE POLICY "Users can view their own quotations" ON quotations
  FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can insert their own quotations" ON quotations
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own quotations" ON quotations
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own quotations" ON quotations
  FOR DELETE USING (auth.uid() = created_by);

-- Quotation items policies
CREATE POLICY "Users can view quotation items for their quotations" ON quotation_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM quotations 
      WHERE quotations.id = quotation_items.quotation_id 
      AND quotations.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can insert quotation items for their quotations" ON quotation_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM quotations 
      WHERE quotations.id = quotation_items.quotation_id 
      AND quotations.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update quotation items for their quotations" ON quotation_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM quotations 
      WHERE quotations.id = quotation_items.quotation_id 
      AND quotations.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can delete quotation items for their quotations" ON quotation_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM quotations 
      WHERE quotations.id = quotation_items.quotation_id 
      AND quotations.created_by = auth.uid()
    )
  );

-- Activities policies
CREATE POLICY "Users can view their own activities" ON activities
  FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can insert their own activities" ON activities
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own activities" ON activities
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own activities" ON activities
  FOR DELETE USING (auth.uid() = created_by);
