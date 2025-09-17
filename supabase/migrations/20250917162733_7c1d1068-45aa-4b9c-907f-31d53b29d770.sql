-- Adicionar campo maqueteira_responsavel na tabela production_stages
ALTER TABLE public.production_stages 
ADD COLUMN maqueteira_responsavel TEXT;

-- Adicionar campo stylist_id na tabela production_stages para rastrear o modelista responsável
ALTER TABLE public.production_stages 
ADD COLUMN stylist_id UUID REFERENCES public.stylists(id);

-- Atualizar a etapa "Piloto Finalizado" para "Prototipagem" em todos os registros existentes
UPDATE public.production_stages 
SET stage_name = 'Prototipagem' 
WHERE stage_name = 'Piloto Finalizado';

-- Atualizar a função que cria as etapas de produção para usar "Prototipagem"
CREATE OR REPLACE FUNCTION public.create_production_stages()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Insert the 6 production stages for new product
  INSERT INTO public.production_stages (product_id, stage_name, stage_order, status) VALUES
    (NEW.id, 'Briefing Recebido', 1, 'pendente'),
    (NEW.id, 'Modelagem Técnica', 2, 'pendente'),
    (NEW.id, 'Prototipagem', 3, 'pendente'),
    (NEW.id, 'Envio para Aprovação', 4, 'pendente'),
    (NEW.id, 'Aprovado', 5, 'pendente'),
    (NEW.id, 'Mostruário e Entregue', 6, 'pendente');
  
  RETURN NEW;
END;
$function$