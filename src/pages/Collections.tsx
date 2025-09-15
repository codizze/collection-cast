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
      name: "Spring Awakening 2024",
      client: "Schutz",
      season: "Spring/Summer 2024",
      startDate: "2024-01-15",
      endDate: "2024-04-30", 
      status: "in-progress",
      modelsCount: 45,
      completedModels: 32,
      progress: 71,
      description: "Fresh and vibrant collection featuring botanical prints and sustainable materials"
    },
    {
      id: "2",
      name: "Urban Elegance",
      client: "Arezzo", 
      season: "Fall/Winter 2024",
      startDate: "2024-02-01",
      endDate: "2024-06-15",
      status: "in-progress",
      modelsCount: 38,
      completedModels: 15,
      progress: 39,
      description: "Sophisticated city-inspired designs with premium leather and metal accents"
    },
    {
      id: "3",
      name: "Summer Vibes",
      client: "Luiza Barcelos",
      season: "Summer 2024",
      startDate: "2024-01-01",
      endDate: "2024-03-31",
      status: "completed",
      modelsCount: 28,
      completedModels: 28,
      progress: 100,
      description: "Colorful and playful summer collection with tropical influences"
    },
    {
      id: "4",
      name: "Classic Reborn",
      client: "Schutz",
      season: "Timeless Collection",
      startDate: "2024-03-01", 
      endDate: "2024-07-30",
      status: "planning",
      modelsCount: 22,
      completedModels: 3,
      progress: 14,
      description: "Revival of iconic styles with modern materials and techniques"
    },
    {
      id: "5",
      name: "Metallic Dreams", 
      client: "Fashion Brand X",
      season: "Holiday 2024",
      startDate: "2024-02-15",
      endDate: "2024-05-15",
      status: "delayed",
      modelsCount: 18,
      completedModels: 8,
      progress: 44,
      description: "Luxurious holiday collection featuring metallic finishes and crystals"
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
          <h1 className="text-3xl font-bold">Collections</h1>
          <p className="text-muted-foreground">Track development progress across all client collections</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:opacity-90">
              <Plus className="mr-2 h-4 w-4" />
              New Collection
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Collection</DialogTitle>
            </DialogHeader>
            <form className="space-y-4">
              <div>
                <Label htmlFor="collectionName">Collection Name</Label>
                <Input id="collectionName" placeholder="Spring Collection 2024" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="client">Client</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="schutz">Schutz</SelectItem>
                      <SelectItem value="arezzo">Arezzo</SelectItem>
                      <SelectItem value="luiza">Luiza Barcelos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="season">Season</Label>
                  <Input id="season" placeholder="Spring/Summer 2024" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input id="startDate" type="date" />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input id="endDate" type="date" />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button className="bg-gradient-primary" onClick={() => setIsDialogOpen(false)}>
                  Create Collection
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
            placeholder="Search collections..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="planning">Planning</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="review">In Review</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="delayed">Delayed</SelectItem>
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
                      <span className="ml-1 capitalize">{collection.status.replace('-', ' ')}</span>
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
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
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
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{collection.progress}%</span>
                </div>
                <Progress value={collection.progress} className="h-2" />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{collection.completedModels} of {collection.modelsCount} models</span>
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
                  {collection.modelsCount} models
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Calendar className="mr-2 h-4 w-4" />
                  {new Date(collection.startDate).toLocaleDateString()} - {new Date(collection.endDate).toLocaleDateString()}
                </div>
              </div>

              <div className="pt-2 border-t">
                <Button variant="outline" className="w-full">
                  View Collection
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCollections.length === 0 && (
        <div className="text-center py-12">
          <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No collections found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || filterStatus !== "all" 
              ? "Try adjusting your search or filters" 
              : "Start by creating your first collection"
            }
          </p>
          <Button className="bg-gradient-primary" onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Collection
          </Button>
        </div>
      )}
    </div>
  );
};

export default Collections;