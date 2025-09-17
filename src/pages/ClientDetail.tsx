import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Building2, Edit, Phone, Mail, MapPin, Calendar, Folder } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Client {
  id: string;
  name: string;
  cnpj?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface Collection {
  id: string;
  name: string;
  status: string;
  season: string;
  start_date?: string;
  end_date?: string;
  budget?: number;
}

const ClientDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [client, setClient] = useState<Client | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchClientDetails();
    }
  }, [id]);

  const fetchClientDetails = async () => {
    try {
      // Fetch client
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single();

      if (clientError) throw clientError;
      setClient(clientData);

      // Fetch client collections
      const { data: collectionsData, error: collectionsError } = await supabase
        .from('collections')
        .select('*')
        .eq('client_id', id)
        .order('created_at', { ascending: false });

      if (collectionsError) throw collectionsError;
      setCollections(collectionsData || []);
    } catch (error) {
      console.error('Erro ao buscar detalhes do cliente:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os detalhes do cliente.",
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

  if (!client) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold mb-2">Cliente não encontrado</h3>
        <Link to="/clients">
          <Button>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Clientes
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/clients">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{client.name}</h1>
              <Badge className={getStatusColor(client.active)}>
                {client.active ? "Ativo" : "Inativo"}
              </Badge>
            </div>
          </div>
        </div>
        <Button>
          <Edit className="h-4 w-4 mr-2" />
          Editar Cliente
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Client Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Informações do Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {client.cnpj && (
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">CNPJ:</span>
                  <span className="text-sm">{client.cnpj}</span>
                </div>
              )}
              {client.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Email:</span>
                  <span className="text-sm">{client.email}</span>
                </div>
              )}
              {client.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Telefone:</span>
                  <span className="text-sm">{client.phone}</span>
                </div>
              )}
            </div>
            
            {(client.address || client.city || client.state) && (
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <span className="text-sm font-medium">Endereço:</span>
                  <div className="text-sm">
                    {client.address && <div>{client.address}</div>}
                    {(client.city || client.state) && (
                      <div>{client.city}{client.city && client.state && ', '}{client.state}</div>
                    )}
                    {client.zip_code && <div>CEP: {client.zip_code}</div>}
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Cliente desde:</span>
              <span className="text-sm">
                {new Date(client.created_at).toLocaleDateString('pt-BR')}
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
          </CardContent>
        </Card>
      </div>

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
                      Temporada: {collection.season}
                    </div>
                    {collection.budget && (
                      <div className="text-sm text-muted-foreground">
                        Orçamento: R$ {collection.budget.toLocaleString('pt-BR')}
                      </div>
                    )}
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

export default ClientDetail;