import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
  Plus, Search, FolderOpen, Calendar, User, Package, Clock, CheckCircle, 
  AlertTriangle, MoreVertical, Edit, Eye, Trash2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Client {
  id: string;
  name: string;
}

interface Stylist {
  id: string;
  name: string;
}

interface Collection {
  id: string;
  name: string;
  client_id: string;
  stylist_id?: string;
  season: string;
  start_date?: string;
  end_date?: string;
  status: string;
  description?: string;
  budget?: number;
  created_at: string;
  updated_at: string;
  clients?: Client;
  stylists?: Stylist;
}

const Collections = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [filteredCollections, setFilteredCollections] = useState<Collection[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    client_id: "",
    stylist_id: "none",
    season: "",
    start_date: "",
    end_date: "",
    status: "planejamento",
    description: "",
    budget: ""
  });

  const statusOptions = [
    { value: "planejamento", label: "Planejamento" },
    { value: "desenvolvimento", label: "Desenvolvimento" },
    { value: "producao", label: "Produção" },
    { value: "entregue", label: "Entregue" },
    { value: "cancelado", label: "Cancelado" }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterCollections();
  }, [collections, searchTerm, filterStatus]);

  const fetchData = async () => {
    try {
      const [collectionsRes, clientsRes, stylistsRes] = await Promise.all([
        supabase
          .from('collections')
          .select(`
            *,
            clients(id, name),
            stylists(id, name)
          `)
          .order('created_at', { ascending: false }),
        supabase.from('clients').select('id, name').eq('active', true).order('name'),
        supabase.from('stylists').select('id, name').eq('active', true).order('name')
      ]);

      if (collectionsRes.error) throw collectionsRes.error;
      if (clientsRes.error) throw clientsRes.error;
      if (stylistsRes.error) throw stylistsRes.error;

      setCollections(collectionsRes.data || []);
      setClients(clientsRes.data || []);
      setStylists(stylistsRes.data || []);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterCollections = () => {
    let filtered = collections;

    if (searchTerm) {
      filtered = filtered.filter(collection =>
        collection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        collection.season.toLowerCase().includes(searchTerm.toLowerCase()) ||
        collection.clients?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter(collection => collection.status === filterStatus);
    }

    setFilteredCollections(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const collectionData = {
        name: formData.name,
        client_id: formData.client_id,
        stylist_id: formData.stylist_id === "none" ? null : formData.stylist_id,
        season: formData.season,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        status: formData.status,
        description: formData.description || null,
        budget: formData.budget ? parseFloat(formData.budget) : null,
      };

      if (editingCollection) {
        const { error } = await supabase
          .from('collections')
          .update(collectionData)
          .eq('id', editingCollection.id);

        if (error) throw error;
        toast({ title: "Sucesso", description: "Coleção atualizada com sucesso!" });
      } else {
        const { error } = await supabase
          .from('collections')
          .insert([collectionData]);

        if (error) throw error;
        toast({ title: "Sucesso", description: "Coleção criada com sucesso!" });
      }

      setIsDialogOpen(false);
      setEditingCollection(null);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Erro ao salvar coleção:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a coleção.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (collection: Collection) => {
    setEditingCollection(collection);
    setFormData({
      name: collection.name,
      client_id: collection.client_id,
      stylist_id: collection.stylist_id || "none",
      season: collection.season,
      start_date: collection.start_date || "",
      end_date: collection.end_date || "",
      status: collection.status,
      description: collection.description || "",
      budget: collection.budget?.toString() || ""
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta coleção?')) return;

    try {
      const { error } = await supabase.from('collections').delete().eq('id', id);
      if (error) throw error;
      toast({ title: "Sucesso", description: "Coleção excluída com sucesso!" });
      fetchData();
    } catch (error) {
      console.error('Erro ao excluir coleção:', error);
      toast({ title: "Erro", description: "Não foi possível excluir a coleção.", variant: "destructive" });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      client_id: "",
      stylist_id: "none",
      season: "",
      start_date: "",
      end_date: "",
      status: "planejamento",
      description: "",
      budget: ""
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'planejamento': return Clock;
      case 'desenvolvimento': return Package;
      case 'producao': return AlertTriangle;
      case 'entregue': return CheckCircle;
      case 'cancelado': return AlertTriangle;
      default: return Clock;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planejamento': return "bg-blue-500";
      case 'desenvolvimento': return "bg-yellow-500";
      case 'producao': return "bg-orange-500";
      case 'entregue': return "bg-green-500";
      case 'cancelado': return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-lg">Carregando coleções...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Coleções</h1>
          <p className="text-muted-foreground">
            Organize e acompanhe o desenvolvimento das suas coleções
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingCollection(null);
              resetForm();
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Coleção
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCollection ? "Editar Coleção" : "Nova Coleção"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Coleção *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="season">Temporada *</Label>
                  <Input
                    id="season"
                    value={formData.season}
                    onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                    placeholder="Ex: Verão 2024, Inverno 2025"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="client_id">Cliente *</Label>
                  <Select value={formData.client_id} onValueChange={(value) => setFormData({ ...formData, client_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stylist_id">Modelista</Label>
                  <Select value={formData.stylist_id} onValueChange={(value) => setFormData({ ...formData, stylist_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um modelista" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum</SelectItem>
                      {stylists.map((stylist) => (
                        <SelectItem key={stylist.id} value={stylist.id}>
                          {stylist.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="start_date">Data Início</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">Data Fim</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget">Orçamento (R$)</Label>
                <Input
                  id="budget"
                  type="number"
                  step="0.01"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingCollection ? "Atualizar" : "Criar"} Coleção
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar coleções..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCollections.map((collection) => {
          const StatusIcon = getStatusIcon(collection.status);
          
          return (
            <Card key={collection.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <FolderOpen className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{collection.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getStatusColor(collection.status)}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusOptions.find(s => s.value === collection.status)?.label}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(collection)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(collection.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4" />
                    <span>{collection.clients?.name}</span>
                  </div>
                  {collection.stylists && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span>Modelista: {collection.stylists.name}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{collection.season}</span>
                  </div>
                </div>

                {(collection.start_date || collection.end_date) && (
                  <div className="text-sm text-muted-foreground">
                    📅 {collection.start_date && new Date(collection.start_date).toLocaleDateString('pt-BR')}
                    {collection.start_date && collection.end_date && ' - '}
                    {collection.end_date && new Date(collection.end_date).toLocaleDateString('pt-BR')}
                  </div>
                )}

                {collection.budget && (
                  <div className="text-sm font-medium">
                    💰 R$ {collection.budget.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                )}

                {collection.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {collection.description}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredCollections.length === 0 && (
        <div className="text-center py-12">
          <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhuma coleção encontrada</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || filterStatus !== "all"
              ? "Tente ajustar os filtros de busca."
              : "Comece criando sua primeira coleção."}
          </p>
          {!searchTerm && filterStatus === "all" && (
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeira Coleção
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default Collections;