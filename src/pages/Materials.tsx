import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, Plus, MoreVertical, Package, TrendingUp, TrendingDown, Edit, Trash2, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Material {
  id: string;
  name: string;
  category: string;
  supplier?: string;
  color?: string;
  composition?: string;
  unit_price?: number;
  stock_quantity: number;
  unit: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

const Materials = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    supplier: "",
    color: "",
    composition: "",
    unit_price: "",
    stock_quantity: "",
    unit: "metro"
  });

  const categories = [
    "Tecido",
    "Botão",
    "Zíper",
    "Linha",
    "Elástico",
    "Forro",
    "Entretela",
    "Aviamento",
    "Outros"
  ];

  const units = [
    "metro",
    "peça",
    "kg",
    "rolo",
    "pacote",
    "lata",
    "litro"
  ];

  useEffect(() => {
    fetchMaterials();
  }, []);

  useEffect(() => {
    filterMaterials();
  }, [materials, searchTerm, filterCategory, filterStatus]);

  const fetchMaterials = async () => {
    try {
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMaterials(data || []);
    } catch (error) {
      console.error('Erro ao buscar materiais:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os materiais.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterMaterials = () => {
    let filtered = materials;

    if (searchTerm) {
      filtered = filtered.filter(material =>
        material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.supplier?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.color?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterCategory !== "all") {
      filtered = filtered.filter(material => material.category === filterCategory);
    }

    if (filterStatus !== "all") {
      const isActive = filterStatus === "active";
      filtered = filtered.filter(material => material.active === isActive);
    }

    setFilteredMaterials(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const materialData = {
        name: formData.name,
        category: formData.category,
        supplier: formData.supplier || null,
        color: formData.color || null,
        composition: formData.composition || null,
        unit_price: formData.unit_price ? parseFloat(formData.unit_price) : null,
        stock_quantity: formData.stock_quantity ? parseInt(formData.stock_quantity) : 0,
        unit: formData.unit,
      };

      if (editingMaterial) {
        const { error } = await supabase
          .from('materials')
          .update(materialData)
          .eq('id', editingMaterial.id);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Material atualizado com sucesso!",
        });
      } else {
        const { error } = await supabase
          .from('materials')
          .insert([materialData]);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Material criado com sucesso!",
        });
      }

      setIsDialogOpen(false);
      setEditingMaterial(null);
      resetForm();
      fetchMaterials();
    } catch (error) {
      console.error('Erro ao salvar material:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o material.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (material: Material) => {
    setEditingMaterial(material);
    setFormData({
      name: material.name,
      category: material.category,
      supplier: material.supplier || "",
      color: material.color || "",
      composition: material.composition || "",
      unit_price: material.unit_price?.toString() || "",
      stock_quantity: material.stock_quantity.toString(),
      unit: material.unit
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este material?')) return;

    try {
      const { error } = await supabase
        .from('materials')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Material excluído com sucesso!",
      });
      
      fetchMaterials();
    } catch (error) {
      console.error('Erro ao excluir material:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o material.",
        variant: "destructive",
      });
    }
  };

  const toggleStatus = async (material: Material) => {
    try {
      const { error } = await supabase
        .from('materials')
        .update({ active: !material.active })
        .eq('id', material.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Material ${material.active ? 'inativado' : 'ativado'} com sucesso!`,
      });
      
      fetchMaterials();
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status do material.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      supplier: "",
      color: "",
      composition: "",
      unit_price: "",
      stock_quantity: "",
      unit: "metro"
    });
  };

  const getStatusColor = (active: boolean) => {
    return active ? "bg-green-500" : "bg-red-500";
  };

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { color: "bg-red-500", icon: TrendingDown, text: "Sem estoque" };
    if (quantity < 10) return { color: "bg-yellow-500", icon: TrendingDown, text: "Estoque baixo" };
    return { color: "bg-green-500", icon: TrendingUp, text: "Em estoque" };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-lg">Carregando materiais...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Materiais</h1>
          <p className="text-muted-foreground">
            Gerencie o estoque de materiais e fornecedores
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingMaterial(null);
              resetForm();
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Material
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingMaterial ? "Editar Material" : "Novo Material"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria *</Label>
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="supplier">Fornecedor</Label>
                  <Input
                    id="supplier"
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color">Cor</Label>
                  <Input
                    id="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="composition">Composição</Label>
                <Textarea
                  id="composition"
                  value={formData.composition}
                  onChange={(e) => setFormData({ ...formData, composition: e.target.value })}
                  placeholder="Ex: 100% algodão, 50% poliéster..."
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="unit_price">Preço Unitário (R$)</Label>
                  <Input
                    id="unit_price"
                    type="number"
                    step="0.01"
                    value={formData.unit_price}
                    onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock_quantity">Quantidade</Label>
                  <Input
                    id="stock_quantity"
                    type="number"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unidade</Label>
                  <Select value={formData.unit} onValueChange={(value) => setFormData({ ...formData, unit: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map((unit) => (
                        <SelectItem key={unit} value={unit}>
                          {unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingMaterial ? "Atualizar" : "Criar"} Material
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar materiais..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas categorias</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Ativos</SelectItem>
            <SelectItem value="inactive">Inativos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMaterials.map((material) => {
          const stockStatus = getStockStatus(material.stock_quantity);
          const StockIcon = stockStatus.icon;
          
          return (
            <Card key={material.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Package className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{material.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getStatusColor(material.active)}>
                          {material.active ? "Ativo" : "Inativo"}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {material.category}
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
                      <DropdownMenuItem onClick={() => handleEdit(material)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleStatus(material)}>
                        <Eye className="h-4 w-4 mr-2" />
                        {material.active ? "Inativar" : "Ativar"}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(material.id)}
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
                {material.supplier && (
                  <div className="text-sm text-muted-foreground">
                    🏢 {material.supplier}
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  {material.color && (
                    <div className="text-sm">
                      🎨 {material.color}
                    </div>
                  )}
                  {material.unit_price && (
                    <div className="text-sm font-medium">
                      R$ {material.unit_price.toFixed(2)}/{material.unit}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StockIcon className="h-4 w-4" />
                    <span className="text-sm">
                      {material.stock_quantity} {material.unit}
                    </span>
                  </div>
                  <Badge className={stockStatus.color} variant="secondary">
                    {stockStatus.text}
                  </Badge>
                </div>

                {material.composition && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {material.composition}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredMaterials.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum material encontrado</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || filterCategory !== "all" || filterStatus !== "all"
              ? "Tente ajustar os filtros de busca."
              : "Comece criando seu primeiro material."}
          </p>
          {!searchTerm && filterCategory === "all" && filterStatus === "all" && (
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Material
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default Materials;