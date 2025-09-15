import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  Plus, 
  Search, 
  Package, 
  Image as ImageIcon, 
  FileText,
  Calendar,
  Tag,
  MoreVertical,
  Edit,
  Eye,
  Trash2,
  Upload
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface Product {
  id: string;
  name: string;
  code: string;
  collection: string;
  client: string;
  status: 'briefing' | 'design' | 'sample' | 'approved' | 'finalized';
  description: string;
  materials: string[];
  createdDate: string;
  imageUrl?: string;
}

const Products = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCollection, setFilterCollection] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const mockProducts: Product[] = [
    {
      id: "1",
      name: "Botanical Sandal",
      code: "SCH-SP24-001",
      collection: "Spring Awakening 2024",
      client: "Schutz",
      status: "approved",
      description: "Elegant sandal with botanical-inspired laser-cut details and sustainable materials",
      materials: ["Recycled Suede", "Cork", "Bio Leather"],
      createdDate: "2024-02-15",
      imageUrl: "/api/placeholder/300/300"
    },
    {
      id: "2", 
      name: "Urban Block Heel",
      code: "ARZ-FW24-012",
      collection: "Urban Elegance",
      client: "Arezzo",
      status: "sample",
      description: "Contemporary block heel with metallic accents and geometric patterns",
      materials: ["Premium Leather", "Metal Hardware", "Rubber Sole"],
      createdDate: "2024-02-20",
      imageUrl: "/api/placeholder/300/300"
    },
    {
      id: "3",
      name: "Tropical Espadrille",
      code: "LB-SM24-008",
      collection: "Summer Vibes", 
      client: "Luiza Barcelos",
      status: "finalized",
      description: "Colorful espadrille with tropical print and woven jute details",
      materials: ["Canvas", "Jute", "Tropical Print"],
      createdDate: "2024-01-10",
      imageUrl: "/api/placeholder/300/300"
    },
    {
      id: "4",
      name: "Classic Pump Reimagined",
      code: "SCH-TC24-005",
      collection: "Classic Reborn",
      client: "Schutz",
      status: "design",
      description: "Modern interpretation of the classic pump with innovative comfort technology",
      materials: ["Nappa Leather", "Memory Foam", "Carbon Fiber"],
      createdDate: "2024-03-05",
      imageUrl: "/api/placeholder/300/300"
    },
    {
      id: "5",
      name: "Metallic Statement Boot",
      code: "FBX-HD24-003",
      collection: "Metallic Dreams",
      client: "Fashion Brand X", 
      status: "briefing",
      description: "Bold ankle boot with metallic finish and crystal embellishments",
      materials: ["Metallic Leather", "Crystals", "Platform Sole"],
      createdDate: "2024-02-28",
      imageUrl: "/api/placeholder/300/300"
    }
  ];

  const collections = ["Spring Awakening 2024", "Urban Elegance", "Summer Vibes", "Classic Reborn", "Metallic Dreams"];

  const filteredProducts = mockProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || product.status === filterStatus;
    const matchesCollection = filterCollection === "all" || product.collection === filterCollection;
    return matchesSearch && matchesStatus && matchesCollection;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'finalized': return 'bg-fashion-success-light text-fashion-success';
      case 'approved': return 'bg-fashion-elegant-light text-fashion-elegant';
      case 'sample': return 'bg-fashion-warning-light text-fashion-warning';
      case 'design': return 'bg-accent text-accent-foreground';
      case 'briefing': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const statusOrder = ['briefing', 'design', 'sample', 'approved', 'finalized'];
  
  const getStatusProgress = (status: string) => {
    return ((statusOrder.indexOf(status) + 1) / statusOrder.length) * 100;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Product Models</h1>
          <p className="text-muted-foreground">Manage individual product development from concept to finalization</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:opacity-90">
              <Plus className="mr-2 h-4 w-4" />
              New Product Model
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Product Model</DialogTitle>
            </DialogHeader>
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="productName">Product Name</Label>
                  <Input id="productName" placeholder="Summer Sandal" />
                </div>
                <div>
                  <Label htmlFor="productCode">Product Code</Label>
                  <Input id="productCode" placeholder="SCH-SP24-001" />
                </div>
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
                  <Label htmlFor="collection">Collection</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select collection" />
                    </SelectTrigger>
                    <SelectContent>
                      {collections.map(collection => (
                        <SelectItem key={collection} value={collection.toLowerCase().replace(/\s+/g, '-')}>
                          {collection}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Describe the product concept, target market, and key features..."
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="materials">Materials (comma-separated)</Label>
                <Input id="materials" placeholder="Leather, Suede, Metal Hardware" />
              </div>
              <div>
                <Label htmlFor="images">Product Images</Label>
                <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Drop files here or click to upload
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG up to 10MB
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button className="bg-gradient-primary" onClick={() => setIsDialogOpen(false)}>
                  Create Product
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
            placeholder="Search by name or code..."
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
            <SelectItem value="briefing">Briefing</SelectItem>
            <SelectItem value="design">Design</SelectItem>
            <SelectItem value="sample">Sample</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="finalized">Finalized</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterCollection} onValueChange={setFilterCollection}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by collection" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Collections</SelectItem>
            {collections.map(collection => (
              <SelectItem key={collection} value={collection}>
                {collection}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="border-0 shadow-custom-md hover:shadow-elegant transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Badge className={getStatusColor(product.status)} variant="secondary">
                    {product.status}
                  </Badge>
                  <CardTitle className="text-lg mb-1">{product.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {product.code}
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
              {/* Product Image Placeholder */}
              <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                <ImageIcon className="h-12 w-12 text-muted-foreground" />
              </div>

              <p className="text-sm text-muted-foreground line-clamp-2">
                {product.description}
              </p>

              {/* Collection & Client */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-muted-foreground">
                  <Package className="mr-2 h-4 w-4" />
                  {product.collection}
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Tag className="mr-2 h-4 w-4" />
                  {product.client}
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Calendar className="mr-2 h-4 w-4" />
                  Created {new Date(product.createdDate).toLocaleDateString()}
                </div>
              </div>

              {/* Materials */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Materials</p>
                <div className="flex flex-wrap gap-1">
                  {product.materials.slice(0, 3).map((material, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {material}
                    </Badge>
                  ))}
                  {product.materials.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{product.materials.length - 3}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t">
                <Button variant="outline" className="w-full">
                  <FileText className="mr-2 h-4 w-4" />
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No products found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || filterStatus !== "all" || filterCollection !== "all"
              ? "Try adjusting your search or filters" 
              : "Start by creating your first product model"
            }
          </p>
          <Button className="bg-gradient-primary" onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Product Model
          </Button>
        </div>
      )}
    </div>
  );
};

export default Products;