import { useState } from "react";
import { useProductionStages } from "@/hooks/useProductionStages";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Package, Calendar, User, Building2, FolderOpen, Tag, DollarSign, Ruler, Trophy } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const Consulta = () => {
  const { products, loading, STAGE_ORDER } = useProductionStages();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStage, setFilterStage] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "rascunho": return "bg-gray-500/10 text-gray-600 border-gray-200";
      case "em_producao": return "bg-blue-500/10 text-blue-600 border-blue-200";
      case "pronto": return "bg-green-500/10 text-green-600 border-green-200";
      case "entregue": return "bg-purple-500/10 text-purple-600 border-purple-200";
      default: return "bg-gray-500/10 text-gray-600 border-gray-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "alta": return "bg-red-500/10 text-red-600 border-red-200";
      case "media": return "bg-yellow-500/10 text-yellow-600 border-yellow-200";
      case "baixa": return "bg-green-500/10 text-green-600 border-green-200";
      default: return "bg-gray-500/10 text-gray-600 border-gray-200";
    }
  };

  const getCurrentStageInfo = (product: any) => {
    const currentStage = product.stages?.find((stage: any) => stage.status === "em_andamento") || 
                        product.stages?.find((stage: any) => stage.status === "pendente");
    return currentStage;
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.collection_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.client_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const currentStage = getCurrentStageInfo(product);
    const matchesStage = filterStage === "all" || currentStage?.stage_name === filterStage;
    const matchesStatus = filterStatus === "all" || product.status === filterStatus;

    return matchesSearch && matchesStage && matchesStatus;
  });

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Consulta de Produtos</h1>
        <p className="text-muted-foreground">
          Visualize todos os produtos em produção com detalhes completos e estágio atual
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, código, coleção ou cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStage} onValueChange={setFilterStage}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filtrar por estágio" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os estágios</SelectItem>
            {STAGE_ORDER.map((stage) => (
              <SelectItem key={stage} value={stage}>
                {stage}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="rascunho">Rascunho</SelectItem>
            <SelectItem value="em_producao">Em Produção</SelectItem>
            <SelectItem value="pronto">Pronto</SelectItem>
            <SelectItem value="entregue">Entregue</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results */}
      <div className="space-y-4">
        <div className="text-sm text-muted-foreground">
          {filteredProducts.length} produto(s) encontrado(s)
        </div>

        {filteredProducts.map((product) => {
          const currentStage = getCurrentStageInfo(product);
          
          return (
            <Card key={product.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex gap-6">
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    <Avatar className="h-20 w-20 rounded-lg">
                      <AvatarImage 
                        src={product.image_url} 
                        alt={product.name}
                        className="object-cover rounded-lg"
                      />
                      <AvatarFallback className="rounded-lg bg-muted">
                        <Package className="h-8 w-8 text-muted-foreground" />
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div>
                        <h3 className="text-lg font-semibold">{product.name || "Sem nome"}</h3>
                        <p className="text-sm text-muted-foreground">Código: {product.code}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={getPriorityColor(product.priority || "media")}>
                          <Trophy className="h-3 w-3 mr-1" />
                          {product.priority || "Média"}
                        </Badge>
                        <Badge className={getStatusColor(product.status)}>
                          <Tag className="h-3 w-3 mr-1" />
                          {product.status}
                        </Badge>
                      </div>
                    </div>

                    {/* Current Stage */}
                    {currentStage && (
                      <div className="bg-muted/50 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Calendar className="h-4 w-4" />
                          Estágio Atual: <span className="text-primary">{currentStage.stage_name}</span>
                        </div>
                        {currentStage.expected_date && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Data prevista: {format(new Date(currentStage.expected_date), "dd/MM/yyyy", { locale: ptBR })}
                          </p>
                        )}
                        {currentStage.maqueteira_responsavel && (
                          <p className="text-xs text-muted-foreground">
                            Responsável: {currentStage.maqueteira_responsavel}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Product Information Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Cliente:</span>
                        </div>
                        <p className="text-muted-foreground pl-6">{product.client_name || "Não definido"}</p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <FolderOpen className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Coleção:</span>
                        </div>
                        <p className="text-muted-foreground pl-6">{product.collection_name || "Não definido"}</p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Modelista:</span>
                        </div>
                        <p className="text-muted-foreground pl-6">Não disponível</p>
                      </div>

                    </div>

                    {/* Description - Placeholder as not available in current interface */}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filteredProducts.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum produto encontrado</h3>
              <p className="text-muted-foreground">
                Tente ajustar os filtros ou termos de busca para encontrar produtos.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Consulta;