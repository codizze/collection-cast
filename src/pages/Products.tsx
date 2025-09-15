import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
  Plus, Search, Package, Image as ImageIcon, FileText, Calendar, Tag, 
  MoreVertical, Edit, Eye, Trash2, Upload
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Client {
  id: string;
  name: string;
}

interface Collection {
  id: string;
  name: string;
  season: string;
}

interface Stylist {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  code: string;
  collection_id: string;
  client_id: string;
  stylist_id?: string;
  category?: string;
  status: string;
  description?: string;
  image_url?: string;
  size_range?: string;
  target_price?: number;
  production_cost?: number;
  estimated_hours?: number;
  priority: string;
  created_at: string;
  updated_at: string;
  clients?: Client;
  collections?: Collection;
  stylists?: Stylist;
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCollection, setFilterCollection] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    collection_id: "",
    client_id: "",
    stylist_id: "",
    category: "",
    status: "rascunho",
    description: "",
    size_range: "",
    target_price: "",
    production_cost: "",
    estimated_hours: "",
    priority: "media"
  });

  const statusOptions = [
    { value: "rascunho", label: "Rascunho" },
    { value: "desenvolvimento", label: "Desenvolvimento" },
    { value: "aprovado", label: "Aprovado" },
    { value: "producao", label: "Produção" },
    { value: "finalizado", label: "Finalizado" },
    { value: "cancelado", label: "Cancelado" }
  ];

  const priorityOptions = [
    { value: "baixa", label: "Baixa" },
    { value: "media", label: "Média" },
    { value: "alta", label: "Alta" },
    { value: "urgente", label: "Urgente" }
  ];

  const categories = [
    "Sandália", "Scarpin", "Sapatilha", "Tênis", "Bota", "Chinelo", 
    "Espadrille", "Oxford", "Mocassim", "Salto Alto", "Salto Baixo", "Outros"
  ];

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, filterStatus, filterCollection]);

  const fetchData = async () => {
    try {
      const [productsRes, clientsRes, collectionsRes, stylistsRes] = await Promise.all([
        supabase
          .from('products')
          .select(`
            *,
            clients(id, name),
            collections(id, name, season),
            stylists(id, name)
          `)
          .order('created_at', { ascending: false }),
        supabase.from('clients').select('id, name').eq('active', true).order('name'),
        supabase.from('collections').select('id, name, season').order('name'),
        supabase.from('stylists').select('id, name').eq('active', true).order('name')
      ]);

      if (productsRes.error) throw productsRes.error;
      if (clientsRes.error) throw clientsRes.error;
      if (collectionsRes.error) throw collectionsRes.error;
      if (stylistsRes.error) throw stylistsRes.error;

      setProducts(productsRes.data || []);
      setClients(clientsRes.data || []);
      setCollections(collectionsRes.data || []);
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

  const filterProducts = () => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.clients?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter(product => product.status === filterStatus);
    }

    if (filterCollection !== "all") {
      filtered = filtered.filter(product => product.collection_id === filterCollection);
    }

    setFilteredProducts(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const productData = {
        name: formData.name,
        code: formData.code,
        collection_id: formData.collection_id,
        client_id: formData.client_id,
        stylist_id: formData.stylist_id || null,
        category: formData.category || null,
        status: formData.status,
        description: formData.description || null,
        size_range: formData.size_range || null,
        target_price: formData.target_price ? parseFloat(formData.target_price) : null,
        production_cost: formData.production_cost ? parseFloat(formData.production_cost) : null,
        estimated_hours: formData.estimated_hours ? parseInt(formData.estimated_hours) : null,
        priority: formData.priority,
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);

        if (error) throw error;
        toast({ title: "Sucesso", description: "Produto atualizado com sucesso!" });
      } else {
        const { error } = await supabase
          .from('products')
          .insert([productData]);

        if (error) throw error;
        toast({ title: "Sucesso", description: "Produto criado com sucesso!" });
      }

      setIsDialogOpen(false);
      setEditingProduct(null);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o produto.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      code: product.code,
      collection_id: product.collection_id,
      client_id: product.client_id,
      stylist_id: product.stylist_id || "",
      category: product.category || "",
      status: product.status,
      description: product.description || "",
      size_range: product.size_range || "",
      target_price: product.target_price?.toString() || "",
      production_cost: product.production_cost?.toString() || "",
      estimated_hours: product.estimated_hours?.toString() || "",
      priority: product.priority
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;

    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      toast({ title: "Sucesso", description: "Produto excluído com sucesso!" });
      fetchData();
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      toast({ title: "Erro", description: "Não foi possível excluir o produto.", variant: "destructive" });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      collection_id: "",
      client_id: "",
      stylist_id: "",
      category: "",
      status: "rascunho",
      description: "",
      size_range: "",
      target_price: "",
      production_cost: "",
      estimated_hours: "",
      priority: "media"
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'rascunho': return "bg-gray-500";
      case 'desenvolvimento': return "bg-blue-500";
      case 'aprovado': return "bg-green-500";
      case 'producao': return "bg-orange-500";
      case 'finalizado': return "bg-purple-500";
      case 'cancelado': return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'baixa': return "bg-green-100 text-green-800";
      case 'media': return "bg-yellow-100 text-yellow-800";
      case 'alta': return "bg-orange-100 text-orange-800";
      case 'urgente': return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-lg">Carregando produtos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Modelos de Produtos</h1>
          <p className="text-muted-foreground">
            Crie e gerencie os modelos da sua produção
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingProduct(null);
              resetForm();
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? "Editar Produto" : "Novo Produto"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Produto *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Código *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="Ex: SCH-PV24-001"
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
                  <Label htmlFor="collection_id">Coleção *</Label>
                  <Select value={formData.collection_id} onValueChange={(value) => setFormData({ ...formData, collection_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma coleção" />
                    </SelectTrigger>
                    <SelectContent>
                      {collections.map((collection) => (
                        <SelectItem key={collection.id} value={collection.id}>
                          {collection.name} - {collection.season}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stylist_id">Modelista</Label>
                  <Select value={formData.stylist_id} onValueChange={(value) => setFormData({ ...formData, stylist_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um modelista" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Nenhum</SelectItem>
                      {stylists.map((stylist) => (
                        <SelectItem key={stylist.id} value={stylist.id}>
                          {stylist.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
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
                  <Label htmlFor="priority">Prioridade</Label>
                  <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorityOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="size_range">Numeração</Label>
                  <Input
                    id="size_range"
                    value={formData.size_range}
                    onChange={(e) => setFormData({ ...formData, size_range: e.target.value })}
                    placeholder="Ex: 35-42, P-M-G"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="target_price">Preço Alvo (R$)</Label>
                  <Input
                    id="target_price"
                    type="number"
                    step="0.01"
                    value={formData.target_price}
                    onChange={(e) => setFormData({ ...formData, target_price: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="production_cost">Custo Produção (R$)</Label>
                  <Input
                    id="production_cost"
                    type="number"
                    step="0.01"
                    value={formData.production_cost}
                    onChange={(e) => setFormData({ ...formData, production_cost: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estimated_hours">Horas Estimadas</Label>
                  <Input
                    id="estimated_hours"
                    type="number"
                    value={formData.estimated_hours}
                    onChange={(e) => setFormData({ ...formData, estimated_hours: e.target.value })}
                  />
                </div>
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
                  {editingProduct ? "Atualizar" : "Criar"} Produto
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
            placeholder="Buscar produtos..."
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
        <Select value={filterCollection} onValueChange={setFilterCollection}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Coleção" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as coleções</SelectItem>
            {collections.map((collection) => (
              <SelectItem key={collection.id} value={collection.id}>
                {collection.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getStatusColor(product.status)}>
                        {statusOptions.find(s => s.value === product.status)?.label}
                      </Badge>
                      <Badge variant="outline" className={getPriorityColor(product.priority)}>
                        {priorityOptions.find(p => p.value === product.priority)?.label}
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
                    <DropdownMenuItem onClick={() => handleEdit(product)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDelete(product.id)}
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
              <div className="text-sm font-mono bg-muted px-2 py-1 rounded">
                {product.code}
              </div>
              
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">
                  🏢 {product.clients?.name}
                </div>
                <div className="text-sm text-muted-foreground">
                  📁 {product.collections?.name}
                </div>
                {product.stylists && (
                  <div className="text-sm text-muted-foreground">
                    👤 {product.stylists.name}
                  </div>
                )}
              </div>

              {product.category && (
                <Badge variant="outline" className="text-xs">
                  {product.category}
                </Badge>
              )}

              <div className="flex justify-between text-sm">
                {product.target_price && (
                  <span className="text-green-600 font-medium">
                    💰 R$ {product.target_price.toFixed(2)}
                  </span>
                )}
                {product.estimated_hours && (
                  <span className="text-muted-foreground">
                    ⏱️ {product.estimated_hours}h
                  </span>
                )}
              </div>

              {product.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {product.description}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum produto encontrado</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || filterStatus !== "all" || filterCollection !== "all"
              ? "Tente ajustar os filtros de busca."
              : "Comece criando seu primeiro produto."}
          </p>
          {!searchTerm && filterStatus === "all" && filterCollection === "all" && (
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Produto
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default Products;