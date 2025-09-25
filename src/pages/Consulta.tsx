import { useState } from "react";
import { useProductionStages } from "@/hooks/useProductionStages";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Package, Calendar, User, Building2, FolderOpen, Tag, Trophy } from "lucide-react";
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
    return product.current_stage;
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

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Foto</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Estágio Atual</TableHead>
                  <TableHead>Data Prevista</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Coleção</TableHead>
                  <TableHead>Responsável</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => {
                  const currentStage = getCurrentStageInfo(product);
                  
                  return (
                    <TableRow key={product.id} className="hover:bg-muted/50">
                      <TableCell>
                        <Avatar className="h-12 w-12 rounded-lg">
                          <AvatarImage 
                            src={product.image_url} 
                            alt={product.name}
                            className="object-cover rounded-lg"
                          />
                          <AvatarFallback className="rounded-lg bg-muted">
                            <Package className="h-4 w-4 text-muted-foreground" />
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{product.name || "Sem nome"}</div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">{product.code}</span>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(product.priority || "media")}>
                          <Trophy className="h-3 w-3 mr-1" />
                          {product.priority || "Média"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(product.status)}>
                          <Tag className="h-3 w-3 mr-1" />
                          {product.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {currentStage ? (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-primary" />
                            <span className="text-sm font-medium text-primary">
                              {currentStage.stage_name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {currentStage?.expected_date ? (
                          <span className="text-sm">
                            {format(new Date(currentStage.expected_date), "dd/MM/yyyy", { locale: ptBR })}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Building2 className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{product.client_name || "Não definido"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <FolderOpen className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{product.collection_name || "Não definido"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {currentStage?.maqueteira_responsavel || "Não definido"}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {filteredProducts.length === 0 && (
              <div className="p-12 text-center">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum produto encontrado</h3>
                <p className="text-muted-foreground">
                  Tente ajustar os filtros ou termos de busca para encontrar produtos.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Consulta;