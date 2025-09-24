-- Adicionar campo active_status para coleções
ALTER TABLE public.collections 
ADD COLUMN active_status text NOT NULL DEFAULT 'ativo';

-- Criar constraint para validar valores permitidos
ALTER TABLE public.collections 
ADD CONSTRAINT collections_active_status_check 
CHECK (active_status IN ('ativo', 'encerrado'));