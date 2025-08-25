-- Function to generate quote numbers
CREATE OR REPLACE FUNCTION generate_quote_number()
RETURNS TEXT AS $$
DECLARE
    year_part TEXT;
    sequence_num INTEGER;
    quote_number TEXT;
BEGIN
    year_part := EXTRACT(YEAR FROM NOW())::TEXT;
    
    -- Get the next sequence number for this year
    SELECT COALESCE(MAX(
        CASE 
            WHEN quote_number LIKE 'QT-' || year_part || '-%' 
            THEN (split_part(quote_number, '-', 3))::INTEGER
            ELSE 0
        END
    ), 0) + 1
    INTO sequence_num
    FROM public.quotations;
    
    quote_number := 'QT-' || year_part || '-' || LPAD(sequence_num::TEXT, 4, '0');
    
    RETURN quote_number;
END;
$$ LANGUAGE plpgsql;

-- Function to update quotation totals
CREATE OR REPLACE FUNCTION update_quotation_totals()
RETURNS TRIGGER AS $$
DECLARE
    quote_id UUID;
    subtotal DECIMAL(15,2);
    tax_amount DECIMAL(15,2);
    discount_amount DECIMAL(15,2);
    total_amount DECIMAL(15,2);
    quote_record RECORD;
BEGIN
    -- Get the quotation ID
    IF TG_OP = 'DELETE' THEN
        quote_id := OLD.quotation_id;
    ELSE
        quote_id := NEW.quotation_id;
    END IF;
    
    -- Calculate subtotal from quotation items
    SELECT COALESCE(SUM(line_total), 0)
    INTO subtotal
    FROM public.quotation_items
    WHERE quotation_id = quote_id;
    
    -- Get quotation details for tax and discount rates
    SELECT tax_rate, discount_rate
    INTO quote_record
    FROM public.quotations
    WHERE id = quote_id;
    
    -- Calculate tax and discount amounts
    discount_amount := subtotal * (quote_record.discount_rate / 100);
    tax_amount := (subtotal - discount_amount) * (quote_record.tax_rate / 100);
    total_amount := subtotal - discount_amount + tax_amount;
    
    -- Update quotation totals
    UPDATE public.quotations
    SET 
        subtotal = subtotal,
        tax_amount = tax_amount,
        discount_amount = discount_amount,
        total_amount = total_amount,
        updated_at = NOW()
    WHERE id = quote_id;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers for quotation totals
CREATE TRIGGER update_quotation_totals_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.quotation_items
    FOR EACH ROW EXECUTE FUNCTION update_quotation_totals();

-- Function to auto-generate quote number on insert
CREATE OR REPLACE FUNCTION set_quote_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.quote_number IS NULL OR NEW.quote_number = '' THEN
        NEW.quote_number := generate_quote_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_quote_number_trigger
    BEFORE INSERT ON public.quotations
    FOR EACH ROW EXECUTE FUNCTION set_quote_number();
