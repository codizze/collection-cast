import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Package2, Edit, DollarSign, Palette, Building, ShoppingCart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Material {
  id: string;
  name: string;
  category: string;
  color?: string;
  composition?: string;
  supplier?: string;
  unit: string;
  unit_price?: number;
  stock_quantity?: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface ProductMaterial {
  id: string;
  quantity: number;
  notes?: string;
  product: {
    id: string;
    name: string;
    code: string;
  };
}

const MaterialDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [material, setMaterial] = useState<Material | null>(null);
  const [productMaterials, setProductMaterials] = useState<ProductMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchMaterialDetails();
    }
  }, [id]);

  const fetchMaterialDetails = async () => {
    try {
      // Fetch material
      const { data: materialData, error: materialError } = await supabase
        .from('materials')
        .select('*')
        .eq('id', id)
        .single();

      if (materialError) throw materialError;
      setMaterial(materialData);

      // Fetch products using this material
      const { data: productMaterialsData, error: productMaterialsError } = await supabase
        .from('product_materials')
        .select(`
          id,
          quantity,
          notes,
          product:products (
            id,
            name,
            code
          )
        `)
        .eq('material_id', id);

      if (productMaterialsError) throw productMaterialsError;
      setProductMaterials(productMaterialsData || []);
    } catch (error) {
      console.error('Erro ao buscar detalhes do material:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os detalhes do material.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (active: boolean) => 
    active ? "bg-fashion-success" : "bg-red-500";

  const getStockStatus = (quantity: number = 0) => {
    if (quantity === 0) return { status: "Sem estoque", color: "bg-red-500" };
    if (quantity <= 10) return { status: "Estoque baixo", color: "bg-fashion-warning" };
    return { status: "Em estoque", color: "bg-fashion-success" };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  if (!material) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold mb-2">Material não encontrado</h3>
        <Link to="/materials">
          <Button>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Materiais
          </Button>
        </Link>
      </div>
    );
  }

  const stockStatus = getStockStatus(material.stock_quantity);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/materials">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-fashion-elegant/10 rounded-full flex items-center justify-center">
              <Package2 className="h-6 w-6 text-fashion-elegant" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{material.name}</h1>
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(material.active)}>
                  {material.active ? "Ativo" : "Inativo"}
                </Badge>
                <Badge className={stockStatus.color}>
                  {stockStatus.status}
                </Badge>
              </div>
            </div>
          </div>
        </div>
        <Button>
          <Edit className="h-4 w-4 mr-2" />
          Editar Material
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Material Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Informações do Material</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Package2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Categoria:</span>
                <span className="text-sm">{material.category}</span>
              </div>

              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Unidade:</span>
                <span className="text-sm">{material.unit}</span>
              </div>

              {material.color && (
                <div className="flex items-center gap-2">
                  <Palette className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Cor:</span>
                  <span className="text-sm">{material.color}</span>
                </div>
              )}

              {material.supplier && (
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Fornecedor:</span>
                  <span className="text-sm">{material.supplier}</span>
                </div>
              )}

              {material.unit_price && (
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Preço unitário:</span>
                  <span className="text-sm">R$ {material.unit_price.toLocaleString('pt-BR')}/{material.unit}</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Package2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Estoque:</span>
                <span className="text-sm">{material.stock_quantity || 0} {material.unit}(s)</span>
              </div>
            </div>

            {material.composition && (
              <div>
                <h4 className="font-medium mb-2">Composição</h4>
                <p className="text-muted-foreground">{material.composition}</p>
              </div>
            )}

            <div className="text-sm text-muted-foreground">
              Cadastrado em: {new Date(material.created_at).toLocaleDateString('pt-BR')}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Estatísticas de Uso</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{productMaterials.length}</div>
              <p className="text-sm text-muted-foreground">Produtos usando este material</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-fashion-elegant">
                {productMaterials.reduce((total, pm) => total + pm.quantity, 0).toFixed(1)}
              </div>
              <p className="text-sm text-muted-foreground">Quantidade total usada</p>
            </div>

            {material.unit_price && (
              <div className="text-center">
                <div className="text-2xl font-bold text-fashion-success">
                  R$ {(material.unit_price * (material.stock_quantity || 0)).toLocaleString('pt-BR')}
                </div>
                <p className="text-sm text-muted-foreground">Valor do estoque</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Products Using This Material */}
      <Card>
        <CardHeader>
          <CardTitle>Produtos que usam este material ({productMaterials.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {productMaterials.length === 0 ? (
            <div className="text-center py-8">
              <Package2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum produto encontrado usando este material</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {productMaterials.map((pm) => (
                <Card key={pm.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <Link to={`/products/${pm.product.id}`}>
                      <CardTitle className="text-base hover:text-primary transition-colors cursor-pointer">
                        {pm.product.name}
                      </CardTitle>
                    </Link>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-sm text-muted-foreground">
                      Código: {pm.product.code}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Quantidade: {pm.quantity} {material.unit}(s)
                    </div>
                    {pm.notes && (
                      <div className="text-sm text-muted-foreground">
                        Observações: {pm.notes}
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

export default MaterialDetail;