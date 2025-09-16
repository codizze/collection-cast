-- Adicionar campo de duração padrão às etapas de produção
ALTER TABLE production_stages ADD COLUMN duration_days INTEGER DEFAULT 3;

-- Atualizar durações padrão para cada etapa
UPDATE production_stages SET duration_days = 2 WHERE stage_name = 'Briefing Recebido';
UPDATE production_stages SET duration_days = 5 WHERE stage_name = 'Modelagem Técnica';
UPDATE production_stages SET duration_days = 7 WHERE stage_name = 'Piloto Finalizado';
UPDATE production_stages SET duration_days = 3 WHERE stage_name = 'Envio para Aprovação';
UPDATE production_stages SET duration_days = 2 WHERE stage_name = 'Aprovado';
UPDATE production_stages SET duration_days = 1 WHERE stage_name = 'Mostruário e Entregue';

-- Criar tabela de configurações de cronograma
CREATE TABLE production_schedule_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_name TEXT NOT NULL UNIQUE,
  duration_days INTEGER NOT NULL,
  priority_multiplier DECIMAL DEFAULT 1.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE production_schedule_config ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow all operations on production_schedule_config" 
ON production_schedule_config 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Inserir configurações padrão
INSERT INTO production_schedule_config (stage_name, duration_days, priority_multiplier) VALUES
('Briefing Recebido', 2, 1.0),
('Modelagem Técnica', 5, 1.2),
('Piloto Finalizado', 7, 1.5),
('Envio para Aprovação', 3, 1.0),
('Aprovado', 2, 0.8),
('Mostruário e Entregue', 1, 0.5);

-- Criar função para calcular cronograma automaticamente
CREATE OR REPLACE FUNCTION calculate_production_schedule(product_id_param UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  collection_end_date DATE;
  current_date DATE;
  stage_rec RECORD;
BEGIN
  -- Buscar data de entrega da coleção
  SELECT COALESCE(c.end_date, c.total_deadline) 
  INTO collection_end_date
  FROM products p
  JOIN collections c ON p.collection_id = c.id
  WHERE p.id = product_id_param;
  
  IF collection_end_date IS NULL THEN
    RETURN;
  END IF;
  
  -- Iniciar a partir da data de entrega
  current_date := collection_end_date;
  
  -- Iterar pelas etapas em ordem reversa
  FOR stage_rec IN 
    SELECT ps.id, ps.stage_order, ps.duration_days
    FROM production_stages ps
    WHERE ps.product_id = product_id_param
    ORDER BY ps.stage_order DESC
  LOOP
    -- Atualizar expected_date para esta etapa
    UPDATE production_stages 
    SET expected_date = current_date
    WHERE id = stage_rec.id;
    
    -- Calcular data anterior (excluindo fins de semana)
    current_date := current_date - INTERVAL '1 day' * stage_rec.duration_days;
    
    -- Ajustar para dia útil anterior se cair em fim de semana
    WHILE EXTRACT(DOW FROM current_date) IN (0, 6) LOOP
      current_date := current_date - INTERVAL '1 day';
    END LOOP;
  END LOOP;
END;
$$;

-- Criar trigger para recalcular cronograma quando produto é criado
CREATE OR REPLACE FUNCTION trigger_calculate_schedule()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Aguardar a criação das etapas pelo trigger existente
  PERFORM pg_sleep(0.1);
  
  -- Calcular cronograma
  PERFORM calculate_production_schedule(NEW.id);
  
  RETURN NEW;
END;
$$;

-- Criar trigger
CREATE TRIGGER calculate_schedule_after_stages
  AFTER INSERT ON products
  FOR EACH ROW
  EXECUTE FUNCTION trigger_calculate_schedule();