-- Corrigir search_path nas funções criadas
CREATE OR REPLACE FUNCTION calculate_production_schedule(product_id_param UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  collection_end_date DATE;
  working_date DATE;
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
  working_date := collection_end_date;
  
  -- Iterar pelas etapas em ordem reversa
  FOR stage_rec IN 
    SELECT ps.id, ps.stage_order, ps.duration_days
    FROM production_stages ps
    WHERE ps.product_id = product_id_param
    ORDER BY ps.stage_order DESC
  LOOP
    -- Atualizar expected_date para esta etapa
    UPDATE production_stages 
    SET expected_date = working_date
    WHERE id = stage_rec.id;
    
    -- Calcular data anterior (excluindo fins de semana)
    working_date := working_date - INTERVAL '1 day' * stage_rec.duration_days;
    
    -- Ajustar para dia útil anterior se cair em fim de semana
    WHILE EXTRACT(DOW FROM working_date) IN (0, 6) LOOP
      working_date := working_date - INTERVAL '1 day';
    END LOOP;
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION trigger_calculate_schedule()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Aguardar a criação das etapas pelo trigger existente
  PERFORM pg_sleep(0.1);
  
  -- Calcular cronograma
  PERFORM calculate_production_schedule(NEW.id);
  
  RETURN NEW;
END;
$$;