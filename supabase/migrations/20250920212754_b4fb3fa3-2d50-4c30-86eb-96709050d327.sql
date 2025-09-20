-- Remover campos não utilizados da tabela products
ALTER TABLE products 
DROP COLUMN category,
DROP COLUMN estimated_hours;

-- Adicionar campo de nível de dificuldade
ALTER TABLE products 
ADD COLUMN difficulty_level text DEFAULT 'medio' CHECK (difficulty_level IN ('baixo', 'medio', 'alto'));

-- Tornar o nome do produto opcional (remover NOT NULL se existir)
ALTER TABLE products 
ALTER COLUMN name DROP NOT NULL;

-- Tornar código obrigatório e único (chave principal adicional)
ALTER TABLE products 
ALTER COLUMN code SET NOT NULL;

-- Adicionar constraint unique no código se não existir
ALTER TABLE products 
ADD CONSTRAINT products_code_unique UNIQUE (code);

-- Comentar para documentar as mudanças
COMMENT ON COLUMN products.difficulty_level IS 'Nível de dificuldade do produto: baixo, medio, alto';
COMMENT ON COLUMN products.code IS 'Código único do produto - chave principal de identificação';
COMMENT ON COLUMN products.name IS 'Nome do produto - campo opcional';