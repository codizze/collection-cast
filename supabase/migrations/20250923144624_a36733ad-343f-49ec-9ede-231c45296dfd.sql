-- Add missing Prototipagem stage configuration
INSERT INTO public.production_schedule_config (stage_name, duration_days, priority_multiplier) 
VALUES ('Prototipagem', 7, 1.0)
ON CONFLICT (stage_name) DO NOTHING;

-- Update existing configurations to ensure consistency
UPDATE public.production_schedule_config SET duration_days = 2 WHERE stage_name = 'Briefing Recebido';
UPDATE public.production_schedule_config SET duration_days = 5 WHERE stage_name = 'Modelagem Técnica';
UPDATE public.production_schedule_config SET duration_days = 7 WHERE stage_name = 'Prototipagem';
UPDATE public.production_schedule_config SET duration_days = 3 WHERE stage_name = 'Envio para Aprovação';
UPDATE public.production_schedule_config SET duration_days = 2 WHERE stage_name = 'Aprovado';
UPDATE public.production_schedule_config SET duration_days = 1 WHERE stage_name = 'Mostruário e Entregue';