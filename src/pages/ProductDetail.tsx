import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Package, Edit, DollarSign, Clock, User, Building2, Folder, Image } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import CommentsSection from "@/components/CommentsSection";

interface Product {
  id: string;
  name: string;
  code: string;
  description?: string;
  category?: string;
  status: string;
  priority?: string;
  target_price?: number;
  production_cost?: number;
  estimated_hours?: number;
  size_range?: string;
  image_url?: string;
  created_at: string;
  collection_id: string;
  client_id: string;
  stylist_id?: string;
}

interface Client {
  id: string;
  name: string;
}

interface Collection {
  id: string;
  name: string;
}

interface Stylist {
  id: string;
  name: string;
}

interface ProductFile {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size?: number;
  uploaded_by?: string;
  created_at: string;
}

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [collection, setCollection] = useState<Collection | null>(null);
  const [stylist, setStylist] = useState<Stylist | null>(null);
  const [files, setFiles] = useState<ProductFile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchProductDetails();
    }
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      // Fetch product
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (productError) throw productError;
      setProduct(productData);

      // Fetch client
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('id, name')
        .eq('id', productData.client_id)
        .single();

      if (clientError) throw clientError;
      setClient(clientData);

      // Fetch collection
      const { data: collectionData, error: collectionError } = await supabase
        .from('collections')
        .select('id, name')
        .eq('id', productData.collection_id)
        .single();

      if (collectionError) throw collectionError;
      setCollection(collectionData);

      // Fetch stylist if exists
      if (productData.stylist_id) {
        const { data: stylistData, error: stylistError } = await supabase
          .from('stylists')
          .select('id, name')
          .eq('id', productData.stylist_id)
          .single();

        if (stylistError) throw stylistError;
        setStylist(stylistData);
      }

      // Fetch product files
      const { data: filesData, error: filesError } = await supabase
        .from('product_files')
        .select('*')
        .eq('product_id', id)
        .order('created_at', { ascending: false });

      if (filesError) throw filesError;
      setFiles(filesData || []);
    } catch (error) {
      console.error('Erro ao buscar detalhes do produto:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os detalhes do produto.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'rascunho': 'bg-muted',
      'desenvolvimento': 'bg-fashion-warning',
      'producao': 'bg-primary',
      'finalizado': 'bg-fashion-success'
    };
    return colors[status] || 'bg-muted';
  };

  const getPriorityColor = (priority?: string) => {
    const colors: Record<string, string> = {
      'baixa': 'bg-green-500',
      'media': 'bg-fashion-warning',
      'alta': 'bg-red-500'
    };
    return colors[priority || 'media'] || 'bg-fashion-warning';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  if (!product || !client || !collection) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold mb-2">Produto não encontrado</h3>
        <Link to="/products">
          <Button>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Produtos
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/products">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{product.name}</h1>
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(product.status)}>
                  {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                </Badge>
                {product.priority && (
                  <Badge className={getPriorityColor(product.priority)}>
                    Prioridade {product.priority.charAt(0).toUpperCase() + product.priority.slice(1)}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
        <Button>
          <Edit className="h-4 w-4 mr-2" />
          Editar Produto
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Informações do Produto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Código:</span>
                <span className="text-sm">{product.code}</span>
              </div>

              {product.category && (
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Categoria:</span>
                  <span className="text-sm">{product.category}</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Cliente:</span>
                <Link to={`/clients/${client.id}`}>
                  <span className="text-sm hover:text-primary cursor-pointer">{client.name}</span>
                </Link>
              </div>

              <div className="flex items-center gap-2">
                <Folder className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Coleção:</span>
                <Link to={`/collections/${collection.id}`}>
                  <span className="text-sm hover:text-primary cursor-pointer">{collection.name}</span>
                </Link>
              </div>

              {stylist && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Modelista:</span>
                  <Link to={`/stylists/${stylist.id}`}>
                    <span className="text-sm hover:text-primary cursor-pointer">{stylist.name}</span>
                  </Link>
                </div>
              )}

              {product.size_range && (
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Tamanhos:</span>
                  <span className="text-sm">{product.size_range}</span>
                </div>
              )}
            </div>

            {product.description && (
              <div>
                <h4 className="font-medium mb-2">Descrição</h4>
                <p className="text-muted-foreground">{product.description}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {product.target_price && (
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Preço Alvo:</span>
                  <span className="text-sm">R$ {product.target_price.toLocaleString('pt-BR')}</span>
                </div>
              )}

              {product.production_cost && (
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Custo:</span>
                  <span className="text-sm">R$ {product.production_cost.toLocaleString('pt-BR')}</span>
                </div>
              )}

              {product.estimated_hours && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Horas Est.:</span>
                  <span className="text-sm">{product.estimated_hours}h</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Product Image */}
        <Card>
          <CardHeader>
            <CardTitle>Imagem do Produto</CardTitle>
          </CardHeader>
          <CardContent>
            {product.image_url ? (
              <img 
                src={product.image_url} 
                alt={product.name}
                className="w-full h-48 object-cover rounded-lg"
              />
            ) : (
              <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Image className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Sem imagem</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Files */}
      <Card>
        <CardHeader>
          <CardTitle>Arquivos ({files.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {files.length === 0 ? (
            <div className="text-center py-8">
              <Image className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum arquivo encontrado</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {files.map((file) => (
                <Card key={file.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Image className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.file_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {file.file_type} • {file.file_size && `${(file.file_size / 1024).toFixed(1)} KB`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(file.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comments */}
      <CommentsSection entityType="product" entityId={id} entityName={product.name} />
    </div>
  );
};

export default ProductDetail;