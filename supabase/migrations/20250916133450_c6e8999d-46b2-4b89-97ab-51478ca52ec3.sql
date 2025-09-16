-- Create product_files table for file attachments
CREATE TABLE public.product_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT,
  uploaded_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.product_files ENABLE ROW LEVEL SECURITY;

-- Create policies for product_files
CREATE POLICY "Allow all operations on product_files" 
ON public.product_files 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create production_stages table for tracking production stages
CREATE TABLE public.production_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  stage_name TEXT NOT NULL,
  stage_order INTEGER NOT NULL,
  expected_date DATE,
  actual_date DATE,
  status TEXT NOT NULL DEFAULT 'pendente',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for production_stages
ALTER TABLE public.production_stages ENABLE ROW LEVEL SECURITY;

-- Create policies for production_stages
CREATE POLICY "Allow all operations on production_stages" 
ON public.production_stages 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Add total_deadline field to collections
ALTER TABLE public.collections 
ADD COLUMN total_deadline DATE;

-- Create storage bucket for product files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-files', 'product-files', true);

-- Create storage policies for product files
CREATE POLICY "Product files are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'product-files');

CREATE POLICY "Users can upload product files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'product-files');

CREATE POLICY "Users can update product files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'product-files');

CREATE POLICY "Users can delete product files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'product-files');

-- Create trigger for production_stages updated_at
CREATE TRIGGER update_production_stages_updated_at
BEFORE UPDATE ON public.production_stages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for product_files updated_at
CREATE TRIGGER update_product_files_updated_at
BEFORE UPDATE ON public.product_files
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to automatically create production stages when a product is created
CREATE OR REPLACE FUNCTION public.create_production_stages()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert the 6 production stages for new product
  INSERT INTO public.production_stages (product_id, stage_name, stage_order, status) VALUES
    (NEW.id, 'Briefing Recebido', 1, 'pendente'),
    (NEW.id, 'Modelagem Técnica', 2, 'pendente'),
    (NEW.id, 'Piloto Finalizado', 3, 'pendente'),
    (NEW.id, 'Envio para Aprovação', 4, 'pendente'),
    (NEW.id, 'Aprovado', 5, 'pendente'),
    (NEW.id, 'Mostruário e Entregue', 6, 'pendente');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically create production stages
CREATE TRIGGER create_production_stages_trigger
AFTER INSERT ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.create_production_stages();