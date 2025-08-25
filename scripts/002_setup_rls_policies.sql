-- Enable Row Level Security on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON public.users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Companies policies
CREATE POLICY "Users can view companies" ON public.companies
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create companies" ON public.companies
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update companies they created" ON public.companies
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Admins can manage all companies" ON public.companies
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role IN ('admin', 'manager')
        )
    );

-- Contacts policies
CREATE POLICY "Users can view contacts" ON public.contacts
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create contacts" ON public.contacts
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update contacts they created" ON public.contacts
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Admins can manage all contacts" ON public.contacts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role IN ('admin', 'manager')
        )
    );

-- Leads policies
CREATE POLICY "Users can view leads" ON public.leads
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create leads" ON public.leads
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their assigned leads" ON public.leads
    FOR UPDATE USING (auth.uid() = assigned_to OR auth.uid() = created_by);

CREATE POLICY "Admins can manage all leads" ON public.leads
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role IN ('admin', 'manager')
        )
    );

-- Products policies
CREATE POLICY "Users can view products" ON public.products
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create products" ON public.products
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Admins can manage all products" ON public.products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role IN ('admin', 'manager')
        )
    );

-- Opportunities policies
CREATE POLICY "Users can view opportunities" ON public.opportunities
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create opportunities" ON public.opportunities
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their assigned opportunities" ON public.opportunities
    FOR UPDATE USING (auth.uid() = assigned_to OR auth.uid() = created_by);

CREATE POLICY "Admins can manage all opportunities" ON public.opportunities
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role IN ('admin', 'manager')
        )
    );

-- Quotations policies
CREATE POLICY "Users can view quotations" ON public.quotations
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create quotations" ON public.quotations
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update quotations they created" ON public.quotations
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Admins can manage all quotations" ON public.quotations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role IN ('admin', 'manager')
        )
    );

-- Quotation items policies
CREATE POLICY "Users can view quotation items" ON public.quotation_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.quotations 
            WHERE id = quotation_id AND created_by = auth.uid()
        )
    );

CREATE POLICY "Users can manage quotation items for their quotations" ON public.quotation_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.quotations 
            WHERE id = quotation_id AND created_by = auth.uid()
        )
    );

CREATE POLICY "Admins can manage all quotation items" ON public.quotation_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role IN ('admin', 'manager')
        )
    );

-- Activities policies
CREATE POLICY "Users can view activities" ON public.activities
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create activities" ON public.activities
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their assigned activities" ON public.activities
    FOR UPDATE USING (auth.uid() = assigned_to OR auth.uid() = created_by);

CREATE POLICY "Admins can manage all activities" ON public.activities
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role IN ('admin', 'manager')
        )
    );
