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
import { Search, Plus, MoreVertical, User, Clock, DollarSign, Star, Edit, Trash2, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Stylist {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  specialty?: string;
  experience_years?: number;
  portfolio_url?: string;
  hourly_rate?: number;
  active: boolean;
  bio?: string;
  skills?: string[];
  created_at: string;
  updated_at: string;
}

const Stylists = () => {
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [filteredStylists, setFilteredStylists] = useState<Stylist[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSpecialty, setFilterSpecialty] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStylist, setEditingStylist] = useState<Stylist | null>(null);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    specialty: "",
    experience_years: "",
    portfolio_url: "",
    hourly_rate: "",
    bio: "",
    skills: ""
  });

  const specialties = [
    "Casual",
    "Formal",
    "Infantil",
    "Festa",
    "Esportivo",
    "Íntimo",
    "Praia",
    "Alfaiataria"
  ];

  useEffect(() => {
    fetchStylists();
  }, []);

  useEffect(() => {
    filterStylists();
  }, [stylists, searchTerm, filterSpecialty, filterStatus]);

  const fetchStylists = async () => {
    try {
      const { data, error } = await supabase
        .from('stylists')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStylists(data || []);
    } catch (error) {
      console.error('Erro ao buscar modelistas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os modelistas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterStylists = () => {
    let filtered = stylists;

    if (searchTerm) {
      filtered = filtered.filter(stylist =>
        stylist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stylist.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stylist.specialty?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterSpecialty !== "all") {
      filtered = filtered.filter(stylist => stylist.specialty === filterSpecialty);
    }

    if (filterStatus !== "all") {
      const isActive = filterStatus === "active";
      filtered = filtered.filter(stylist => stylist.active === isActive);
    }

    setFilteredStylists(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(s => s);
      
      const stylistData = {
        name: formData.name,
        email: formData.email || null,
        phone: formData.phone || null,
        specialty: formData.specialty || null,
        experience_years: formData.experience_years ? parseInt(formData.experience_years) : null,
        portfolio_url: formData.portfolio_url || null,
        hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : null,
        bio: formData.bio || null,
        skills: skillsArray.length > 0 ? skillsArray : null,
      };

      if (editingStylist) {
        const { error } = await supabase
          .from('stylists')
          .update(stylistData)
          .eq('id', editingStylist.id);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Modelista atualizado com sucesso!",
        });
      } else {
        const { error } = await supabase
          .from('stylists')
          .insert([stylistData]);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Modelista criado com sucesso!",
        });
      }

      setIsDialogOpen(false);
      setEditingStylist(null);
      resetForm();
      fetchStylists();
    } catch (error) {
      console.error('Erro ao salvar modelista:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o modelista.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (stylist: Stylist) => {
    setEditingStylist(stylist);
    setFormData({
      name: stylist.name,
      email: stylist.email || "",
      phone: stylist.phone || "",
      specialty: stylist.specialty || "",
      experience_years: stylist.experience_years?.toString() || "",
      portfolio_url: stylist.portfolio_url || "",
      hourly_rate: stylist.hourly_rate?.toString() || "",
      bio: stylist.bio || "",
      skills: stylist.skills?.join(', ') || ""
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este modelista?')) return;

    try {
      const { error } = await supabase
        .from('stylists')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Modelista excluído com sucesso!",
      });
      
      fetchStylists();
    } catch (error) {
      console.error('Erro ao excluir modelista:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o modelista.",
        variant: "destructive",
      });
    }
  };

  const toggleStatus = async (stylist: Stylist) => {
    try {
      const { error } = await supabase
        .from('stylists')
        .update({ active: !stylist.active })
        .eq('id', stylist.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Modelista ${stylist.active ? 'inativado' : 'ativado'} com sucesso!`,
      });
      
      fetchStylists();
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status do modelista.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      specialty: "",
      experience_years: "",
      portfolio_url: "",
      hourly_rate: "",
      bio: "",
      skills: ""
    });
  };

  const getStatusColor = (active: boolean) => {
    return active ? "bg-green-500" : "bg-red-500";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-lg">Carregando modelistas...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Modelistas</h1>
          <p className="text-muted-foreground">
            Gerencie sua equipe de modelistas e suas especialidades
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingStylist(null);
              resetForm();
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Modelista
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingStylist ? "Editar Modelista" : "Novo Modelista"}
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
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialty">Especialidade</Label>
                  <Select value={formData.specialty} onValueChange={(value) => setFormData({ ...formData, specialty: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma especialidade" />
                    </SelectTrigger>
                    <SelectContent>
                      {specialties.map((specialty) => (
                        <SelectItem key={specialty} value={specialty}>
                          {specialty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="experience_years">Anos de Experiência</Label>
                  <Input
                    id="experience_years"
                    type="number"
                    value={formData.experience_years}
                    onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hourly_rate">Valor/Hora (R$)</Label>
                  <Input
                    id="hourly_rate"
                    type="number"
                    step="0.01"
                    value={formData.hourly_rate}
                    onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="portfolio_url">URL do Portfolio</Label>
                <Input
                  id="portfolio_url"
                  type="url"
                  value={formData.portfolio_url}
                  onChange={(e) => setFormData({ ...formData, portfolio_url: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="skills">Habilidades (separadas por vírgula)</Label>
                <Input
                  id="skills"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  placeholder="Ex: Costura, Corte, Modelagem, etc."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Biografia</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingStylist ? "Atualizar" : "Criar"} Modelista
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
            placeholder="Buscar modelistas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterSpecialty} onValueChange={setFilterSpecialty}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Especialidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas especialidades</SelectItem>
            {specialties.map((specialty) => (
              <SelectItem key={specialty} value={specialty}>
                {specialty}
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

      {/* Stylists Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStylists.map((stylist) => (
          <Card key={stylist.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <Link to={`/stylists/${stylist.id}`}>
                      <CardTitle className="text-lg hover:text-primary transition-colors cursor-pointer">{stylist.name}</CardTitle>
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getStatusColor(stylist.active)}>
                        {stylist.active ? "Ativo" : "Inativo"}
                      </Badge>
                      {stylist.specialty && (
                        <Badge variant="outline" className="text-xs">
                          {stylist.specialty}
                        </Badge>
                      )}
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
                    <DropdownMenuItem onClick={() => handleEdit(stylist)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toggleStatus(stylist)}>
                      <Eye className="h-4 w-4 mr-2" />
                      {stylist.active ? "Inativar" : "Ativar"}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDelete(stylist.id)}
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
              {stylist.email && (
                <div className="text-sm text-muted-foreground">
                  📧 {stylist.email}
                </div>
              )}
              {stylist.phone && (
                <div className="text-sm text-muted-foreground">
                  📞 {stylist.phone}
                </div>
              )}
              
              <div className="flex items-center justify-between">
                {stylist.experience_years && (
                  <div className="flex items-center gap-1 text-sm">
                    <Clock className="h-4 w-4" />
                    {stylist.experience_years} anos
                  </div>
                )}
                {stylist.hourly_rate && (
                  <div className="flex items-center gap-1 text-sm">
                    <DollarSign className="h-4 w-4" />
                    R$ {stylist.hourly_rate.toFixed(2)}/h
                  </div>
                )}
              </div>

              {stylist.skills && stylist.skills.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {stylist.skills.slice(0, 3).map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {stylist.skills.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{stylist.skills.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              {stylist.bio && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {stylist.bio}
                </p>
              )}

              {stylist.portfolio_url && (
                <div className="pt-2">
                  <a 
                    href={stylist.portfolio_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    <Star className="h-4 w-4" />
                    Ver Portfolio
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredStylists.length === 0 && (
        <div className="text-center py-12">
          <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum modelista encontrado</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || filterSpecialty !== "all" || filterStatus !== "all"
              ? "Tente ajustar os filtros de busca."
              : "Comece criando seu primeiro modelista."}
          </p>
          {!searchTerm && filterSpecialty === "all" && filterStatus === "all" && (
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Modelista
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default Stylists;