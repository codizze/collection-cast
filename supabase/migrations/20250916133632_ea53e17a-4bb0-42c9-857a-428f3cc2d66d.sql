-- Fix function search path security issue
CREATE OR REPLACE FUNCTION public.create_production_stages()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;