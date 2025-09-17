import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Folder, Edit, Calendar, DollarSign, User, Building2, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import CommentsSection from "@/components/CommentsSection";

interface Collection {
  id: string;
  name: string;
  description?: string;
  season: string;
  status: string;
  start_date?: string;
  end_date?: string;
  total_deadline?: string;
  budget?: number;
  created_at: string;
  client_id: string;
  stylist_id?: string;
}

interface Client {
  id: string;
  name: string;
}

interface Stylist {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  code: string;
  status: string;
  category?: string;
}

const CollectionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [stylist, setStylist] = useState<Stylist | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchCollectionDetails();
    }
  }, [id]);

  const fetchCollectionDetails = async () => {
    try {
      // Fetch collection
      const { data: collectionData, error: collectionError } = await supabase
        .from('collections')
        .select('*')
        .eq('id', id)
        .single();

      if (collectionError) throw collectionError;
      setCollection(collectionData);

      // Fetch client
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('id, name')
        .eq('id', collectionData.client_id)
        .single();

      if (clientError) throw clientError;
      setClient(clientData);

      // Fetch stylist if exists
      if (collectionData.stylist_id) {
        const { data: stylistData, error: stylistError } = await supabase
          .from('stylists')
          .select('id, name')
          .eq('id', collectionData.stylist_id)
          .single();

        if (stylistError) throw stylistError;
        setStylist(stylistData);
      }

      // Fetch products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('id, name, code, status, category')
        .eq('collection_id', id)
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;
      setProducts(productsData || []);
    } catch (error) {
      console.error('Erro ao buscar detalhes da coleção:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os detalhes da coleção.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'planejamento': 'bg-blue-500',
      'desenvolvimento': 'bg-fashion-warning',
      'producao': 'bg-primary',
      'finalizado': 'bg-fashion-success',
      'cancelado': 'bg-red-500'
    };
    return colors[status] || 'bg-muted';
  };

  const getProductStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'rascunho': 'bg-muted',
      'desenvolvimento': 'bg-fashion-warning',
      'producao': 'bg-primary',
      'finalizado': 'bg-fashion-success'
    };
    return colors[status] || 'bg-muted';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  if (!collection || !client) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold mb-2">Coleção não encontrada</h3>
        <Link to="/collections">
          <Button>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Coleções
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/collections">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-fashion-elegant/10 rounded-full flex items-center justify-center">
              <Folder className="h-6 w-6 text-fashion-elegant" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{collection.name}</h1>
              <Badge className={getStatusColor(collection.status)}>
                {collection.status.charAt(0).toUpperCase() + collection.status.slice(1)}
              </Badge>
            </div>
          </div>
        </div>
        <Button>
          <Edit className="h-4 w-4 mr-2" />
          Editar Coleção
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Collection Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Informações da Coleção</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {collection.description && (
              <div>
                <h4 className="font-medium mb-2">Descrição</h4>
                <p className="text-muted-foreground">{collection.description}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Cliente:</span>
                <Link to={`/clients/${client.id}`}>
                  <span className="text-sm hover:text-primary cursor-pointer">{client.name}</span>
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

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Temporada:</span>
                <span className="text-sm">{collection.season}</span>
              </div>

              {collection.budget && (
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Orçamento:</span>
                  <span className="text-sm">R$ {collection.budget.toLocaleString('pt-BR')}</span>
                </div>
              )}
            </div>

            {(collection.start_date || collection.end_date) && (
              <div className="space-y-2">
                <h4 className="font-medium">Cronograma</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {collection.start_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Início:</span>
                      <span className="text-sm">
                        {new Date(collection.start_date).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  )}
                  {collection.end_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Fim:</span>
                      <span className="text-sm">
                        {new Date(collection.end_date).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Estatísticas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{products.length}</div>
              <p className="text-sm text-muted-foreground">Produtos Totais</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-fashion-warning">
                {products.filter(p => p.status === 'desenvolvimento').length}
              </div>
              <p className="text-sm text-muted-foreground">Em Desenvolvimento</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-fashion-success">
                {products.filter(p => p.status === 'finalizado').length}
              </div>
              <p className="text-sm text-muted-foreground">Finalizados</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Produtos ({products.length})
            </CardTitle>
            <Link to="/products">
              <Button variant="outline" size="sm">
                Ver Todos os Produtos
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum produto encontrado</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <Card key={product.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <Link to={`/products/${product.id}`}>
                      <CardTitle className="text-base hover:text-primary transition-colors cursor-pointer">
                        {product.name}
                      </CardTitle>
                    </Link>
                    <Badge className={getProductStatusColor(product.status)}>
                      {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-sm text-muted-foreground">
                      Código: {product.code}
                    </div>
                    {product.category && (
                      <div className="text-sm text-muted-foreground">
                        Categoria: {product.category}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comments */}
      <CommentsSection entityType="collection" entityId={id} entityName={collection.name} />
    </div>
  );
};

export default CollectionDetail;