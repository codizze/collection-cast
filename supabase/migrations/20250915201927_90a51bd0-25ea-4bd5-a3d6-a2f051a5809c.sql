-- Criação de todas as tabelas principais para o sistema de gestão de modelos

-- Tabela de clientes
CREATE TABLE public.clients (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    cnpj TEXT UNIQUE,
    email TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de modelistas (nova entidade)
CREATE TABLE public.stylists (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT,
    specialty TEXT, -- Ex: casual, formal, infantil, etc.
    experience_years INTEGER,
    portfolio_url TEXT,
    hourly_rate DECIMAL(10,2),
    active BOOLEAN NOT NULL DEFAULT true,
    bio TEXT,
    skills TEXT[], -- Array de habilidades
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de coleções
CREATE TABLE public.collections (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    stylist_id UUID REFERENCES public.stylists(id) ON DELETE SET NULL,
    season TEXT NOT NULL, -- Ex: Verão 2024, Inverno 2025
    start_date DATE,
    end_date DATE,
    status TEXT NOT NULL DEFAULT 'planejamento' CHECK (status IN ('planejamento', 'desenvolvimento', 'producao', 'entregue', 'cancelado')),
    description TEXT,
    budget DECIMAL(12,2),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de materiais
CREATE TABLE public.materials (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL, -- Ex: tecido, botão, zíper, etc.
    supplier TEXT,
    color TEXT,
    composition TEXT,
    unit_price DECIMAL(10,2),
    stock_quantity INTEGER DEFAULT 0,
    unit TEXT NOT NULL DEFAULT 'metro', -- metro, peça, kg, etc.
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de produtos/modelos
CREATE TABLE public.products (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    stylist_id UUID REFERENCES public.stylists(id) ON DELETE SET NULL,
    category TEXT, -- Ex: vestido, calça, camisa, etc.
    status TEXT NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'desenvolvimento', 'aprovado', 'producao', 'finalizado', 'cancelado')),
    description TEXT,
    image_url TEXT,
    size_range TEXT, -- Ex: P-M-G, 36-42, etc.
    target_price DECIMAL(10,2),
    production_cost DECIMAL(10,2),
    estimated_hours INTEGER,
    priority TEXT DEFAULT 'media' CHECK (priority IN ('baixa', 'media', 'alta', 'urgente')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de relacionamento produto-material
CREATE TABLE public.product_materials (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    material_id UUID NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
    quantity DECIMAL(10,3) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(product_id, material_id)
);

-- Tabela de tarefas do workflow
CREATE TABLE public.tasks (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    collection_id UUID REFERENCES public.collections(id) ON DELETE CASCADE,
    stylist_id UUID REFERENCES public.stylists(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_andamento', 'concluida', 'cancelada')),
    priority TEXT DEFAULT 'media' CHECK (priority IN ('baixa', 'media', 'alta', 'urgente')),
    due_date DATE,
    estimated_hours INTEGER,
    actual_hours INTEGER,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de comentários
CREATE TABLE public.comments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    content TEXT NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    collection_id UUID REFERENCES public.collections(id) ON DELETE CASCADE,
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL, -- Por enquanto sem auth, mas preparado para futuro
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CHECK ((product_id IS NOT NULL)::integer + (collection_id IS NOT NULL)::integer + (task_id IS NOT NULL)::integer = 1)
);

-- Habilitar Row Level Security
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stylists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Políticas RLS temporárias (permitir tudo por enquanto - sem auth ainda)
CREATE POLICY "Allow all operations on clients" ON public.clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on stylists" ON public.stylists FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on collections" ON public.collections FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on materials" ON public.materials FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on products" ON public.products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on product_materials" ON public.product_materials FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on tasks" ON public.tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on comments" ON public.comments FOR ALL USING (true) WITH CHECK (true);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers para updated_at
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_stylists_updated_at BEFORE UPDATE ON public.stylists FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_collections_updated_at BEFORE UPDATE ON public.collections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_materials_updated_at BEFORE UPDATE ON public.materials FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON public.comments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para performance
CREATE INDEX idx_collections_client_id ON public.collections(client_id);
CREATE INDEX idx_collections_stylist_id ON public.collections(stylist_id);
CREATE INDEX idx_products_collection_id ON public.products(collection_id);
CREATE INDEX idx_products_client_id ON public.products(client_id);
CREATE INDEX idx_products_stylist_id ON public.products(stylist_id);
CREATE INDEX idx_products_status ON public.products(status);
CREATE INDEX idx_tasks_product_id ON public.tasks(product_id);
CREATE INDEX idx_tasks_collection_id ON public.tasks(collection_id);
CREATE INDEX idx_tasks_stylist_id ON public.tasks(stylist_id);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_comments_product_id ON public.comments(product_id);
CREATE INDEX idx_comments_collection_id ON public.comments(collection_id);
CREATE INDEX idx_comments_task_id ON public.comments(task_id);