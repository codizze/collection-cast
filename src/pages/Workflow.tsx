import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Plus, Clock, User, AlertTriangle, Calendar, Filter, 
  MoreVertical, Edit, Trash2, MessageSquare
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Task {
  id: string;
  title: string;
  description?: string;
  product_id?: string;
  collection_id?: string;
  stylist_id?: string;
  status: string;
  priority: string;
  due_date?: string;
  estimated_hours?: number;
  actual_hours?: number;
  created_at: string;
  updated_at: string;
  products?: { name: string; code: string };
  collections?: { name: string; season: string };
  stylists?: { name: string };
}

interface Client {
  id: string;
  name: string;
}

interface Collection {
  id: string;
  name: string;
  season: string;
}

interface Product {
  id: string;
  name: string;
  code: string;
}

interface Stylist {
  id: string;
  name: string;
}

const columns = [
  { id: 'pendente', title: 'Pendente', color: 'bg-gray-100' },
  { id: 'em_andamento', title: 'Em Andamento', color: 'bg-blue-100' },
  { id: 'concluida', title: 'Concluída', color: 'bg-green-100' },
  { id: 'cancelada', title: 'Cancelada', color: 'bg-red-100' }
];

const priorities = [
  { value: 'baixa', label: 'Baixa', color: 'bg-green-100 text-green-800' },
  { value: 'media', label: 'Média', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'alta', label: 'Alta', color: 'bg-orange-100 text-orange-800' },
  { value: 'urgente', label: 'Urgente', color: 'bg-red-100 text-red-800' }
];

const Workflow = () => {
  const [tasks, setTasks] = useState<Record<string, Task[]>>({
    pendente: [],
    em_andamento: [],
    concluida: [],
    cancelada: []
  });
  const [clients, setClients] = useState<Client[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCollection, setFilterCollection] = useState("all");
  const [filterStylist, setFilterStylist] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    product_id: "",
    collection_id: "",
    stylist_id: "none",
    status: "pendente",
    priority: "media",
    due_date: "",
    estimated_hours: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filterCollection, filterStylist]);

  const fetchData = async () => {
    try {
      const [tasksRes, collectionsRes, productsRes, stylistsRes] = await Promise.all([
        supabase
          .from('tasks')
          .select(`
            *,
            products(name, code),
            collections(name, season),
            stylists(name)
          `)
          .order('created_at', { ascending: false }),
        supabase.from('collections').select('id, name, season').order('name'),
        supabase.from('products').select('id, name, code').order('name'),
        supabase.from('stylists').select('id, name').eq('active', true).order('name')
      ]);

      if (tasksRes.error) throw tasksRes.error;
      if (collectionsRes.error) throw collectionsRes.error;
      if (productsRes.error) throw productsRes.error;
      if (stylistsRes.error) throw stylistsRes.error;

      // Organize tasks by status
      const tasksByStatus: Record<string, Task[]> = {
        pendente: [],
        em_andamento: [],
        concluida: [],
        cancelada: []
      };

      tasksRes.data?.forEach(task => {
        if (tasksByStatus[task.status]) {
          tasksByStatus[task.status].push(task);
        }
      });

      setTasks(tasksByStatus);
      setCollections(collectionsRes.data || []);
      setProducts(productsRes.data || []);
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

  const applyFilters = async () => {
    try {
      let query = supabase
        .from('tasks')
        .select(`
          *,
          products(name, code),
          collections(name, season),
          stylists(name)
        `);

      if (filterCollection !== "all") {
        query = query.eq('collection_id', filterCollection);
      }

      if (filterStylist !== "all") {
        query = query.eq('stylist_id', filterStylist);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      const tasksByStatus: Record<string, Task[]> = {
        pendente: [],
        em_andamento: [],
        concluida: [],
        cancelada: []
      };

      data?.forEach(task => {
        if (tasksByStatus[task.status]) {
          tasksByStatus[task.status].push(task);
        }
      });

      setTasks(tasksByStatus);
    } catch (error) {
      console.error('Erro ao filtrar tarefas:', error);
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    if (source.droppableId === destination.droppableId) return;

    try {
      // Update task status in database
      const { error } = await supabase
        .from('tasks')
        .update({ status: destination.droppableId })
        .eq('id', draggableId);

      if (error) throw error;

      // Update local state
      const newTasks = { ...tasks };
      const [movedTask] = newTasks[source.droppableId].splice(source.index, 1);
      movedTask.status = destination.droppableId;
      newTasks[destination.droppableId].splice(destination.index, 0, movedTask);
      
      setTasks(newTasks);

      toast({
        title: "Sucesso",
        description: "Status da tarefa atualizado!",
      });
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a tarefa.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const taskData = {
        title: formData.title,
        description: formData.description || null,
        product_id: formData.product_id || null,
        collection_id: formData.collection_id || null,
        stylist_id: formData.stylist_id === "none" ? null : formData.stylist_id,
        status: formData.status,
        priority: formData.priority,
        due_date: formData.due_date || null,
        estimated_hours: formData.estimated_hours ? parseInt(formData.estimated_hours) : null,
      };

      if (editingTask) {
        const { error } = await supabase
          .from('tasks')
          .update(taskData)
          .eq('id', editingTask.id);

        if (error) throw error;
        toast({ title: "Sucesso", description: "Tarefa atualizada com sucesso!" });
      } else {
        const { error } = await supabase
          .from('tasks')
          .insert([taskData]);

        if (error) throw error;
        toast({ title: "Sucesso", description: "Tarefa criada com sucesso!" });
      }

      setIsDialogOpen(false);
      setEditingTask(null);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Erro ao salvar tarefa:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a tarefa.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || "",
      product_id: task.product_id || "",
      collection_id: task.collection_id || "",
      stylist_id: task.stylist_id || "none",
      status: task.status,
      priority: task.priority,
      due_date: task.due_date || "",
      estimated_hours: task.estimated_hours?.toString() || ""
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta tarefa?')) return;

    try {
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) throw error;
      toast({ title: "Sucesso", description: "Tarefa excluída com sucesso!" });
      fetchData();
    } catch (error) {
      console.error('Erro ao excluir tarefa:', error);
      toast({ title: "Erro", description: "Não foi possível excluir a tarefa.", variant: "destructive" });
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      product_id: "",
      collection_id: "",
      stylist_id: "none",
      status: "pendente",
      priority: "media",
      due_date: "",
      estimated_hours: ""
    });
  };

  const getPriorityColor = (priority: string) => {
    return priorities.find(p => p.value === priority)?.color || 'bg-gray-100';
  };

  const isOverdue = (dueDate: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-lg">Carregando workflow...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Fluxo de Trabalho</h1>
          <p className="text-muted-foreground">
            Quadro Kanban para acompanhar o desenvolvimento das tarefas
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingTask(null);
              resetForm();
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Tarefa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTask ? "Editar Tarefa" : "Nova Tarefa"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="collection_id">Coleção</Label>
                  <Select value={formData.collection_id} onValueChange={(value) => setFormData({ ...formData, collection_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma coleção" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Nenhuma</SelectItem>
                      {collections.map((collection) => (
                        <SelectItem key={collection.id} value={collection.id}>
                          {collection.name} - {collection.season}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product_id">Produto</Label>
                  <Select value={formData.product_id} onValueChange={(value) => setFormData({ ...formData, product_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um produto" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Nenhum</SelectItem>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.code} - {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stylist_id">Responsável</Label>
                  <Select value={formData.stylist_id} onValueChange={(value) => setFormData({ ...formData, stylist_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um responsável" />
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
                <div className="space-y-2">
                  <Label htmlFor="priority">Prioridade</Label>
                  <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map((priority) => (
                        <SelectItem key={priority.value} value={priority.value}>
                          {priority.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="due_date">Data Limite</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
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

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingTask ? "Atualizar" : "Criar"} Tarefa
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select value={filterCollection} onValueChange={setFilterCollection}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por coleção" />
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
        <Select value={filterStylist} onValueChange={setFilterStylist}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por responsável" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os responsáveis</SelectItem>
            {stylists.map((stylist) => (
              <SelectItem key={stylist.id} value={stylist.id}>
                {stylist.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {columns.map((column) => (
            <div key={column.id} className="space-y-4">
              <div className={`p-4 rounded-lg ${column.color}`}>
                <h3 className="font-semibold text-lg">{column.title}</h3>
                <span className="text-sm text-muted-foreground">
                  {tasks[column.id]?.length || 0} tarefas
                </span>
              </div>

              <Droppable droppableId={column.id}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="space-y-3 min-h-[200px]"
                  >
                    {tasks[column.id]?.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <Card className="hover:shadow-md transition-shadow cursor-move">
                              <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                  <CardTitle className="text-sm font-medium line-clamp-2">
                                    {task.title}
                                  </CardTitle>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => handleEdit(task)}>
                                        <Edit className="h-4 w-4 mr-2" />
                                        Editar
                                      </DropdownMenuItem>
                                      <DropdownMenuItem 
                                        onClick={() => handleDelete(task.id)}
                                        className="text-destructive"
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Excluir
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                                <div className="flex gap-2">
                                  <Badge className={getPriorityColor(task.priority)}>
                                    {priorities.find(p => p.value === task.priority)?.label}
                                  </Badge>
                                  {task.due_date && isOverdue(task.due_date) && (
                                    <Badge variant="destructive">
                                      <AlertTriangle className="h-3 w-3 mr-1" />
                                      Atrasada
                                    </Badge>
                                  )}
                                </div>
                              </CardHeader>
                              <CardContent className="space-y-2">
                                {task.products && (
                                  <div className="text-xs text-muted-foreground">
                                    📦 {task.products.code} - {task.products.name}
                                  </div>
                                )}
                                {task.collections && (
                                  <div className="text-xs text-muted-foreground">
                                    📁 {task.collections.name}
                                  </div>
                                )}
                                {task.stylists && (
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <User className="h-3 w-3" />
                                    {task.stylists.name}
                                  </div>
                                )}
                                {task.due_date && (
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(task.due_date).toLocaleDateString('pt-BR')}
                                  </div>
                                )}
                                {task.estimated_hours && (
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    {task.estimated_hours}h estimadas
                                  </div>
                                )}
                                {task.description && (
                                  <p className="text-xs text-muted-foreground line-clamp-2">
                                    {task.description}
                                  </p>
                                )}
                              </CardContent>
                            </Card>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default Workflow;