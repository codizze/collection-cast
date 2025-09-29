import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { Monitor, Filter, Search, Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ProductCard } from "@/components/kanban/ProductCard";
import { TVMode } from "@/components/kanban/TVMode";
import { useProductionStages } from "@/hooks/useProductionStages";
import { supabase } from "@/integrations/supabase/client";

interface Collection {
  id: string;
  name: string;
}

interface Client {
  id: string;
  name: string;
}

export function ProductWorkflow() {
  const {
    products,
    loading,
    STAGE_ORDER,
    advanceToNextStage,
    moveToStage,
    uploadFile,
    deleteFile,
    getProductsByStage,
    isOverdue,
    refetch
  } = useProductionStages();

  const [collections, setCollections] = useState<Collection[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCollection, setFilterCollection] = useState<string>("all");
  const [filterClient, setFilterClient] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [tvMode, setTvMode] = useState(false);

  useEffect(() => {
    fetchFilters();
  }, []);

  const fetchFilters = async () => {
    try {
      const [collectionsRes, clientsRes] = await Promise.all([
        supabase.from('collections').select('id, name'),
        supabase.from('clients').select('id, name')
      ]);

      if (collectionsRes.data) setCollections(collectionsRes.data);
      if (clientsRes.data) setClients(clientsRes.data);
    } catch (error) {
      console.error('Error fetching filters:', error);
    }
  };

  const filteredProducts = products.filter(product => {
    // Safety check for product structure
    if (!product || !product.current_stage) {
      return false;
    }

    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.code.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCollection = filterCollection === 'all' || !filterCollection || product.collection_name === filterCollection;
    const matchesClient = filterClient === 'all' || !filterClient || product.client_name === filterClient;
    
    let matchesStatus = true;
    if (filterStatus === 'overdue') {
      matchesStatus = isOverdue(product);
    } else if (filterStatus === 'on_time') {
      matchesStatus = !isOverdue(product) && product.current_stage?.status !== 'concluida';
    } else if (filterStatus === 'completed') {
      matchesStatus = product.current_stage?.status === 'concluida';
    } else if (filterStatus === 'all') {
      matchesStatus = true;
    }

    return matchesSearch && matchesCollection && matchesClient && matchesStatus;
  });

  const handleStageUpdate = async (productId: string, action: string) => {
    if (action === 'next') {
      await advanceToNextStage(productId);
    }
  };

  const handleFileUpload = async (productId: string, file: File) => {
    await uploadFile(productId, file);
  };

  const handleFileDelete = async (fileId: string) => {
    if (confirm('Tem certeza que deseja excluir este arquivo?')) {
      await deleteFile(fileId);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    
    if (!destination) return;
    if (destination.droppableId === source.droppableId) return;

    const productId = draggableId;
    const newStageName = destination.droppableId;
    
    await moveToStage(productId, newStageName);
  };

  if (tvMode) {
    return (
      <TVMode 
        products={filteredProducts}
        stages={STAGE_ORDER}
        getProductsByStage={getProductsByStage}
        isOverdue={isOverdue}
        onExitTVMode={() => setTvMode(false)}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Fluxo de Produção</h1>
          <p className="text-muted-foreground">
            Acompanhe o progresso dos produtos através das etapas de produção
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
          <Button onClick={() => setTvMode(true)} variant="outline">
            <Monitor className="w-4 h-4 mr-2" />
            Modo TV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 p-4 bg-muted/50 rounded-lg">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Buscar produtos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        
        <Select value={filterCollection} onValueChange={setFilterCollection}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Coleção" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas coleções</SelectItem>
            {collections.map(collection => (
              <SelectItem key={collection.id} value={collection.name}>
                {collection.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterClient} onValueChange={setFilterClient}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Cliente" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos clientes</SelectItem>
            {clients.map(client => (
              <SelectItem key={client.id} value={client.name}>
                {client.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos status</SelectItem>
            <SelectItem value="overdue">Atrasados</SelectItem>
            <SelectItem value="on_time">No prazo</SelectItem>
            <SelectItem value="completed">Concluídos</SelectItem>
          </SelectContent>
        </Select>

        {(searchTerm || (filterCollection && filterCollection !== 'all') || (filterClient && filterClient !== 'all') || (filterStatus && filterStatus !== 'all')) && (
          <Button 
            variant="ghost" 
            onClick={() => {
              setSearchTerm("");
              setFilterCollection("all");
              setFilterClient("all");
              setFilterStatus("all");
            }}
          >
            Limpar filtros
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border rounded-lg p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Total</h3>
          <p className="text-2xl font-bold">{filteredProducts.length}</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Em Andamento</h3>
          <p className="text-2xl font-bold text-blue-600">
            {filteredProducts.filter(p => p.current_stage?.status === 'em_andamento').length}
          </p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Atrasados</h3>
          <p className="text-2xl font-bold text-red-600">
            {filteredProducts.filter(p => p.current_stage && isOverdue(p)).length}
          </p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Concluídos</h3>
          <p className="text-2xl font-bold text-green-600">
            {filteredProducts.filter(p => p.current_stage?.status === 'concluida').length}
          </p>
        </div>
      </div>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-6 overflow-x-auto pb-4">
          {STAGE_ORDER.map((stageName, index) => {
            const stageProducts = filteredProducts.filter(product => 
              product.current_stage?.stage_name === stageName
            );

            return (
              <div key={stageName} className="min-w-[300px] flex-shrink-0">
                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-sm">
                      {stageName} ({stageProducts.length})
                    </h3>
                  </div>

                  <Droppable droppableId={stageName}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`space-y-3 min-h-[200px] transition-all duration-200 ${
                          snapshot.isDraggingOver ? 'bg-primary/10 rounded-lg border-2 border-primary border-dashed' : ''
                        }`}
                      >
                        {stageProducts.map((product, productIndex) => (
                          <Draggable
                            key={product.id}
                            draggableId={product.id}
                            index={productIndex}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`transition-all duration-200 ${
                                  snapshot.isDragging ? 'rotate-2 shadow-lg scale-105 z-50' : 'hover:shadow-md'
                                }`}
                              >
                                <ProductCard
                                  product={product}
                                  files={product.files}
                                  currentStage={product.current_stage}
                                  isOverdue={isOverdue(product)}
                                  onStageUpdate={handleStageUpdate}
                                  onFileUpload={handleFileUpload}
                                  onFileDelete={handleFileDelete}
                                  onRefetch={refetch}
                                />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}

export default ProductWorkflow;