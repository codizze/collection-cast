import { useState } from "react";
import { X, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface ImageFile {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string;
}

interface ImageGalleryProps {
  images: ImageFile[];
  onDelete: (fileId: string) => Promise<void>;
}

export function ImageGallery({ images, onDelete }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<ImageFile | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const openLightbox = (image: ImageFile) => {
    setSelectedImage(image);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
    setLightboxOpen(false);
  };

  const handleDownload = (image: ImageFile) => {
    const link = document.createElement('a');
    link.href = image.file_url;
    link.download = image.file_name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (images.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Nenhuma imagem anexada</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image) => (
          <div key={image.id} className="relative group">
            <div 
              className="aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer"
              onClick={() => openLightbox(image)}
            >
              <img
                src={image.file_url}
                alt={image.file_name}
                className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
              />
            </div>
            
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(image);
                }}
              >
                <Download className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(image.file_url, '_blank');
                }}
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(image.id);
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* File name */}
            <p className="text-xs text-muted-foreground mt-1 truncate">
              {image.file_name}
            </p>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-4xl w-full max-h-[90vh] p-0">
          {selectedImage && (
            <div className="relative">
              <img
                src={selectedImage.file_url}
                alt={selectedImage.file_name}
                className="w-full max-h-[80vh] object-contain"
              />
              
              {/* Controls */}
              <div className="absolute top-4 right-4 flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleDownload(selectedImage)}
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => window.open(selectedImage.file_url, '_blank')}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={closeLightbox}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* File info */}
              <div className="absolute bottom-4 left-4 bg-black/75 text-white px-3 py-2 rounded-lg">
                <p className="text-sm font-medium">{selectedImage.file_name}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}