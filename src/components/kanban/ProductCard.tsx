import { useState } from "react";
import { Calendar, FileText, AlertTriangle, CheckCircle, Clock, MoreVertical } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileUpload } from "./FileUpload";
import { ImageGallery } from "./ImageGallery";
import { SetMainImage } from "./SetMainImage";

interface ProductFile {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
}

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    code: string;
    image_url?: string;
    collection_name?: string;
    client_name?: string;
    priority?: string;
    status: string;
    created_at: string;
  };
  files: ProductFile[];
  currentStage: {
    stage_name: string;
    expected_date?: string;
    actual_date?: string;
    status: string;
    maqueteira_responsavel?: string;
  } | null;
  isOverdue: boolean;
  onStageUpdate: (productId: string, newStage: string) => void;
  onFileUpload: (productId: string, file: File) => Promise<void>;
  onFileDelete: (fileId: string) => Promise<void>;
}

export function ProductCard({ 
  product, 
  files, 
  currentStage, 
  isOverdue, 
  onStageUpdate, 
  onFileUpload, 
  onFileDelete 
}: ProductCardProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'concluida':
        return 'bg-green-500/20 text-green-700 border-green-200';
      case 'em_andamento':
        return 'bg-yellow-500/20 text-yellow-700 border-yellow-200';
      case 'atrasada':
        return 'bg-red-500/20 text-red-700 border-red-200';
      default:
        return 'bg-gray-500/20 text-gray-700 border-gray-200';
    }
  };

  // Handle case where currentStage might be null
  const stageStatus = currentStage?.status || 'pendente';
  const stageName = currentStage?.stage_name || 'Sem etapa definida';

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'alta':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'media':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'baixa':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Não definido';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    try {
      await onFileUpload(product.id, file);
    } finally {
      setUploading(false);
    }
  };

  const imageFiles = files.filter(f => f.file_type.startsWith('image/'));
  const documentFiles = files.filter(f => !f.file_type.startsWith('image/'));

  return (
    <Card className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-lg ${
      isOverdue ? 'ring-2 ring-red-400 bg-red-50/50' : ''
    }`}>
      {/* Product Image - Show main image or first uploaded image as fallback */}
      {(product.image_url || (imageFiles.length > 0)) && (
        <div className="w-full h-32 mb-3 rounded-lg overflow-hidden bg-muted">
          <img 
            src={product.image_url || imageFiles[0]?.file_url} 
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h4 className="font-semibold text-sm mb-1 line-clamp-2">{product.name}</h4>
          <p className="text-xs text-muted-foreground">{product.code}</p>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setDetailsOpen(true)}>
              Ver detalhes
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStageUpdate(product.id, 'next')}>
              Avançar etapa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Collection and Client */}
      <div className="space-y-1 mb-3">
        {product.collection_name && (
          <Badge variant="outline" className="text-xs">
            {product.collection_name}
          </Badge>
        )}
        {product.client_name && (
          <Badge variant="secondary" className="text-xs">
            {product.client_name}
          </Badge>
        )}
      </div>

      {/* Status and Priority */}
      <div className="flex gap-2 mb-3">
        <Badge className={`text-xs ${getStatusColor(stageStatus)}`}>
          {stageStatus === 'concluida' && <CheckCircle className="w-3 h-3 mr-1" />}
          {stageStatus === 'em_andamento' && <Clock className="w-3 h-3 mr-1" />}
          {stageStatus === 'atrasada' && <AlertTriangle className="w-3 h-3 mr-1" />}
          {stageName}
        </Badge>
        
        {product.priority && (
          <Badge className={`text-xs ${getPriorityColor(product.priority)}`}>
            {product.priority}
          </Badge>
        )}
      </div>

      {/* Modelista */}
      {currentStage?.maqueteira_responsavel && (
        <div className="text-xs text-muted-foreground mb-2">
          <span className="font-medium">Modelista:</span> {currentStage.maqueteira_responsavel}
        </div>
      )}

      {/* Dates */}
      {currentStage?.expected_date && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
          <Calendar className="w-3 h-3" />
          <span>Previsto: {formatDate(currentStage.expected_date)}</span>
        </div>
      )}

      {/* Files indicator */}
      {files.length > 0 && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <FileText className="w-3 h-3" />
          <span>{files.length} arquivo{files.length > 1 ? 's' : ''}</span>
        </div>
      )}

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{product.name} - {product.code}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Product Image - Show main image or first uploaded image */}
            {(product.image_url || imageFiles.length > 0) && (
              <div className="w-full h-48 rounded-lg overflow-hidden bg-muted mb-4">
                <img 
                  src={product.image_url || imageFiles[0]?.file_url} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Stage Info */}
            <div className="space-y-2">
              <h4 className="font-semibold">Etapa Atual</h4>
              <div className="flex gap-2">
                <Badge className={getStatusColor(stageStatus)}>
                  {stageName}
                </Badge>
              </div>
              <div className="text-sm space-y-1">
                <p>Data prevista: {formatDate(currentStage?.expected_date)}</p>
                {currentStage?.actual_date && (
                  <p>Data realizada: {formatDate(currentStage.actual_date)}</p>
                )}
              </div>
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <h4 className="font-semibold">Arquivos</h4>
              <FileUpload 
                onFileUpload={handleFileUpload}
                uploading={uploading}
              />
            </div>

            {/* Set Main Image */}
            {imageFiles.length > 0 && (
              <div className="space-y-2">
                <SetMainImage 
                  images={imageFiles}
                  productId={product.id}
                  currentMainImage={product.image_url}
                  onMainImageSet={() => {
                    // Refresh the parent component data
                    window.location.reload();
                  }}
                />
              </div>
            )}

            {/* Image Gallery */}
            {imageFiles.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold">Galeria de Imagens</h4>
                <ImageGallery 
                  images={imageFiles} 
                  onDelete={onFileDelete}
                />
              </div>
            )}

            {/* Document Files */}
            {documentFiles.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold">Documentos</h4>
                <div className="space-y-2">
                  {documentFiles.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        <span className="text-sm">{file.file_name}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => window.open(file.file_url, '_blank')}
                        >
                          Abrir
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => onFileDelete(file.id)}
                        >
                          Excluir
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}