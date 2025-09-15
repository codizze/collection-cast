import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Plus, 
  Search, 
  FolderOpen, 
  Calendar, 
  User,
  Package,
  Clock,
  CheckCircle,
  AlertTriangle,
  MoreVertical,
  Edit,
  Eye,
  Trash2
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface Collection {
  id: string;
  name: string;
  client: string;
  season: string;
  startDate: string;
  endDate: string;
  status: 'planning' | 'in-progress' | 'review' | 'completed' | 'delayed';
  modelsCount: number;
  completedModels: number;
  progress: number;
  description: string;
}

const Collections = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const mockCollections: Collection[] = [
    {
      id: "1",
      name: "Despertar da Primavera 2024",
      client: "Schutz",
      season: "Primavera/Verão 2024",
      startDate: "2024-01-15",
      endDate: "2024-04-30", 
      status: "in-progress",
      modelsCount: 45,
      completedModels: 32,
      progress: 71,
      description: "Coleção fresca e vibrante com estampas botânicas e materiais sustentáveis"
    },
    {
      id: "2",
      name: "Elegância Urbana",
      client: "Arezzo", 
      season: "Outono/Inverno 2024",
      startDate: "2024-02-01",
      endDate: "2024-06-15",
      status: "in-progress",
      modelsCount: 38,
      completedModels: 15,
      progress: 39,
      description: "Designs sofisticados inspirados na cidade com couro premium e detalhes metálicos"
    },
    {
      id: "3",
      name: "Vibes de Verão",
      client: "Luiza Barcelos",
      season: "Verão 2024",
      startDate: "2024-01-01",
      endDate: "2024-03-31",
      status: "completed",
      modelsCount: 28,
      completedModels: 28,
      progress: 100,
      description: "Coleção colorida e divertida de verão com influências tropicais"
    },
    {
      id: "4",
      name: "Clássico Renascido",
      client: "Schutz",
      season: "Coleção Atemporal",
      startDate: "2024-03-01", 
      endDate: "2024-07-30",
      status: "planning",
      modelsCount: 22,
      completedModels: 3,
      progress: 14,
      description: "Revival de estilos icônicos com materiais e técnicas modernas"
    },
    {
      id: "5",
      name: "Sonhos Metálicos", 
      client: "Fashion Brand X",
      season: "Holiday 2024",
      startDate: "2024-02-15",
      endDate: "2024-05-15",
      status: "delayed",
      modelsCount: 18,
      completedModels: 8,
      progress: 44,
      description: "Coleção luxuosa de festa com acabamentos metálicos e cristais"
    }
  ];

  const filteredCollections = mockCollections.filter(collection => {
    const matchesSearch = collection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         collection.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || collection.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'delayed': return <AlertTriangle className="h-4 w-4" />;
      case 'in-progress': return <Clock className="h-4 w-4" />;
      default: return <FolderOpen className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-fashion-success-light text-fashion-success';
      case 'delayed': return 'bg-fashion-warning-light text-fashion-warning';
      case 'in-progress': return 'bg-fashion-elegant-light text-fashion-elegant';
      case 'review': return 'bg-accent text-accent-foreground';
      case 'planning': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Coleções</h1>
          <p className="text-muted-foreground">Acompanhe o progresso de desenvolvimento de todas as coleções dos clientes</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:opacity-90">
              <Plus className="mr-2 h-4 w-4" />
              Nova Coleção
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Criar Nova Coleção</DialogTitle>
            </DialogHeader>
            <form className="space-y-4">
              <div>
                <Label htmlFor="collectionName">Nome da Coleção</Label>
                <Input id="collectionName" placeholder="Coleção Primavera 2024" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="client">Cliente</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="schutz">Schutz</SelectItem>
                      <SelectItem value="arezzo">Arezzo</SelectItem>
                      <SelectItem value="luiza">Luiza Barcelos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="season">Estação</Label>
                  <Input id="season" placeholder="Primavera/Verão 2024" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Data de Início</Label>
                  <Input id="startDate" type="date" />
                </div>
                <div>
                  <Label htmlFor="endDate">Data de Término</Label>
                  <Input id="endDate" type="date" />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button className="bg-gradient-primary" onClick={() => setIsDialogOpen(false)}>
                  Criar Coleção
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar coleções..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Status</SelectItem>
            <SelectItem value="planning">Planejamento</SelectItem>
            <SelectItem value="in-progress">Em Andamento</SelectItem>
            <SelectItem value="review">Em Revisão</SelectItem>
            <SelectItem value="completed">Concluída</SelectItem>
            <SelectItem value="delayed">Atrasada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Collections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCollections.map((collection) => (
          <Card key={collection.id} className="border-0 shadow-custom-md hover:shadow-elegant transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getStatusColor(collection.status)} variant="secondary">
                      {getStatusIcon(collection.status)}
                      <span className="ml-1 capitalize">
                        {collection.status === 'completed' ? 'concluída' :
                         collection.status === 'in-progress' ? 'em andamento' :
                         collection.status === 'delayed' ? 'atrasada' :
                         collection.status === 'planning' ? 'planejamento' :
                         collection.status === 'review' ? 'revisão' :
                         collection.status}
                      </span>
                    </Badge>
                  </div>
                  <CardTitle className="text-lg mb-1">{collection.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {collection.client} • {collection.season}
                  </CardDescription>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="mr-2 h-4 w-4" />
                      Ver Detalhes
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {collection.description}
              </p>

              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progresso</span>
                  <span className="font-medium">{collection.progress}%</span>
                </div>
                <Progress value={collection.progress} className="h-2" />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{collection.completedModels} de {collection.modelsCount} modelos</span>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-muted-foreground">
                  <User className="mr-2 h-4 w-4" />
                  {collection.client}
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Package className="mr-2 h-4 w-4" />
                  {collection.modelsCount} modelos
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Calendar className="mr-2 h-4 w-4" />
                  {new Date(collection.startDate).toLocaleDateString()} - {new Date(collection.endDate).toLocaleDateString()}
                </div>
              </div>

              <div className="pt-2 border-t">
                <Button variant="outline" className="w-full">
                  Ver Coleção
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCollections.length === 0 && (
        <div className="text-center py-12">
          <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhuma coleção encontrada</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || filterStatus !== "all" 
              ? "Tente ajustar sua busca ou filtros" 
              : "Comece criando sua primeira coleção"
            }
          </p>
          <Button className="bg-gradient-primary" onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Coleção
          </Button>
        </div>
      )}
    </div>
  );
};

export default Collections;