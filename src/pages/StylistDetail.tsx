import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User, Edit, DollarSign, Calendar, Mail, Phone, Star, Folder, Award, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Stylist {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  specialty?: string;
  portfolio_url?: string;
  bio?: string;
  skills?: string[];
  hourly_rate?: number;
  experience_years?: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface StylistCollection {
  id: string;
  name: string;
  status: string;
  season: string;
  start_date?: string;
  end_date?: string;
  client: {
    id: string;
    name: string;
  };
}

interface Product {
  id: string;
  name: string;
  code: string;
  image_url?: string;
  status: string;
  current_stage?: {
    stage_name: string;
    status: string;
  };
  collection: {
    name: string;
  };
}

const StylistDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [stylist, setStylist] = useState<Stylist | null>(null);
  const [collections, setCollections] = useState<StylistCollection[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchStylistDetails();
    }
  }, [id]);

  const fetchStylistDetails = async () => {
    try {
      // Fetch stylist
      const { data: stylistData, error: stylistError } = await supabase
        .from('stylists')
        .select('*')
        .eq('id', id)
        .single();

      if (stylistError) throw stylistError;
      setStylist(stylistData);

      // Fetch stylist collections
      const { data: collectionsData, error: collectionsError } = await supabase
        .from('collections')
        .select(`
          id,
          name,
          status,
          season,
          start_date,
          end_date,
          client:clients (
            id,
            name
          )
        `)
        .eq('stylist_id', id)
        .order('created_at', { ascending: false });

      if (collectionsError) throw collectionsError;
      setCollections(collectionsData || []);

      // Fetch products assigned to this stylist
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select(`
          id,
          name,
          code,
          image_url,
          status,
          collections!inner(name)
        `)
        .eq('stylist_id', id)
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;

      // Fetch production stages for these products
      if (productsData && productsData.length > 0) {
        const productIds = productsData.map(p => p.id);
        const { data: stagesData, error: stagesError } = await supabase
          .from('production_stages')
          .select('product_id, stage_name, status, stage_order')
          .in('product_id', productIds)
          .order('stage_order');

        if (!stagesError && stagesData) {
          const productsWithStages = productsData.map(product => {
            const productStages = stagesData.filter(s => s.product_id === product.id);
            const currentStage = productStages.find(s => s.status === 'em_andamento' || s.status === 'pendente');
            
            return {
              id: product.id,
              name: product.name,
              code: product.code,
              image_url: product.image_url,
              status: product.status,
              collection: product.collections,
              current_stage: currentStage || productStages[productStages.length - 1]
            };
          });
          setProducts(productsWithStages);
        }
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes do modelista:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os detalhes do modelista.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (active: boolean) => 
    active ? "bg-fashion-success" : "bg-red-500";

  const getCollectionStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'planejamento': 'bg-blue-500',
      'desenvolvimento': 'bg-fashion-warning',
      'producao': 'bg-primary',
      'finalizado': 'bg-fashion-success',
      'cancelado': 'bg-red-500'
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

  if (!stylist) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold mb-2">Modelista não encontrado</h3>
        <Link to="/stylists">
          <Button>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Modelistas
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/stylists">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-fashion-luxury/10 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-fashion-luxury" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{stylist.name}</h1>
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(stylist.active)}>
                  {stylist.active ? "Ativo" : "Inativo"}
                </Badge>
                {stylist.specialty && (
                  <Badge variant="outline">
                    {stylist.specialty}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
        <Button>
          <Edit className="h-4 w-4 mr-2" />
          Editar Modelista
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stylist Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Informações do Modelista</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stylist.bio && (
              <div>
                <h4 className="font-medium mb-2">Biografia</h4>
                <p className="text-muted-foreground">{stylist.bio}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stylist.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Email:</span>
                  <span className="text-sm">{stylist.email}</span>
                </div>
              )}

              {stylist.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Telefone:</span>
                  <span className="text-sm">{stylist.phone}</span>
                </div>
              )}

              {stylist.experience_years && (
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Experiência:</span>
                  <span className="text-sm">{stylist.experience_years} anos</span>
                </div>
              )}

              {stylist.hourly_rate && (
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Valor/hora:</span>
                  <span className="text-sm">R$ {stylist.hourly_rate.toLocaleString('pt-BR')}</span>
                </div>
              )}

              {stylist.portfolio_url && (
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Portfolio:</span>
                  <a 
                    href={stylist.portfolio_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    Ver Portfolio
                  </a>
                </div>
              )}
            </div>

            {stylist.skills && stylist.skills.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Habilidades</h4>
                <div className="flex flex-wrap gap-2">
                  {stylist.skills.map((skill, index) => (
                    <Badge key={index} variant="outline">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Cadastrado em:</span>
              <span className="text-sm">
                {new Date(stylist.created_at).toLocaleDateString('pt-BR')}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Estatísticas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{collections.length}</div>
              <p className="text-sm text-muted-foreground">Coleções Totais</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-fashion-success">
                {collections.filter(c => c.status !== 'cancelado' && c.status !== 'finalizado').length}
              </div>
              <p className="text-sm text-muted-foreground">Coleções Ativas</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-fashion-warning">
                {collections.filter(c => c.status === 'finalizado').length}
              </div>
              <p className="text-sm text-muted-foreground">Finalizadas</p>
            </div>
            {stylist.experience_years && (
              <div className="text-center">
                <div className="text-2xl font-bold text-fashion-elegant">{stylist.experience_years}</div>
                <p className="text-sm text-muted-foreground">Anos de Experiência</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Products in Production */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Produtos em Produção ({products.length})
            </CardTitle>
            <Link to="/workflow">
              <Button variant="outline" size="sm">
                Ver Workflow Completo
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum produto em produção</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {products.map((product) => (
                <Link key={product.id} to="/workflow">
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="aspect-square mb-3 bg-muted rounded-md overflow-hidden">
                        {product.image_url ? (
                          <img 
                            src={product.image_url} 
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-12 w-12 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div>
                          <h4 className="font-semibold text-sm">{product.name}</h4>
                          <p className="text-xs text-muted-foreground">{product.code}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {product.collection?.name}
                        </Badge>
                        {product.current_stage && (
                          <div className="text-xs">
                            <span className="font-medium">Estágio:</span>
                            <p className="text-muted-foreground">{product.current_stage.stage_name}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Collections */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Folder className="h-5 w-5" />
              Coleções ({collections.length})
            </CardTitle>
            <Link to="/collections">
              <Button variant="outline" size="sm">
                Ver Todas as Coleções
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {collections.length === 0 ? (
            <div className="text-center py-8">
              <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhuma coleção encontrada</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {collections.map((collection) => (
                <Card key={collection.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <Link to={`/collections/${collection.id}`}>
                      <CardTitle className="text-base hover:text-primary transition-colors cursor-pointer">
                        {collection.name}
                      </CardTitle>
                    </Link>
                    <Badge className={getCollectionStatusColor(collection.status)}>
                      {collection.status.charAt(0).toUpperCase() + collection.status.slice(1)}
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-sm text-muted-foreground">
                      Cliente: 
                      <Link to={`/clients/${collection.client.id}`}>
                        <span className="hover:text-primary cursor-pointer"> {collection.client.name}</span>
                      </Link>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Temporada: {collection.season}
                    </div>
                    {collection.start_date && (
                      <div className="text-sm text-muted-foreground">
                        Início: {new Date(collection.start_date).toLocaleDateString('pt-BR')}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StylistDetail;