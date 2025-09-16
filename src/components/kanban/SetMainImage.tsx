import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Star, StarOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ImageFile {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string;
}

interface SetMainImageProps {
  images: ImageFile[];
  productId: string;
  currentMainImage?: string;
  onMainImageSet: () => void;
}

export function SetMainImage({ images, productId, currentMainImage, onMainImageSet }: SetMainImageProps) {
  const { toast } = useToast();

  const setAsMainImage = async (imageUrl: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ image_url: imageUrl })
        .eq('id', productId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Imagem principal definida com sucesso",
      });

      onMainImageSet();
    } catch (error) {
      console.error('Error setting main image:', error);
      toast({
        title: "Erro",
        description: "Erro ao definir imagem principal",
        variant: "destructive",
      });
    }
  };

  const removeMainImage = async () => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ image_url: null })
        .eq('id', productId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Imagem principal removida",
      });

      onMainImageSet();
    } catch (error) {
      console.error('Error removing main image:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover imagem principal",
        variant: "destructive",
      });
    }
  };

  if (images.length === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center py-4">
        Nenhuma imagem disponível para definir como principal
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">Definir Imagem Principal</h4>
        {currentMainImage && (
          <Button
            size="sm"
            variant="outline"
            onClick={removeMainImage}
          >
            <StarOff className="h-4 w-4 mr-2" />
            Remover Principal
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {images.map((image) => (
          <Card key={image.id} className="relative group">
            <div className="aspect-square overflow-hidden rounded-lg">
              <img
                src={image.file_url}
                alt={image.file_name}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
              <Button
                size="sm"
                variant={currentMainImage === image.file_url ? "default" : "secondary"}
                onClick={() => setAsMainImage(image.file_url)}
              >
                <Star className={`h-4 w-4 mr-1 ${currentMainImage === image.file_url ? 'fill-current' : ''}`} />
                {currentMainImage === image.file_url ? 'Principal' : 'Definir'}
              </Button>
            </div>
            
            {currentMainImage === image.file_url && (
              <Badge className="absolute top-2 right-2 bg-yellow-500 text-yellow-900">
                <Star className="h-3 w-3 mr-1 fill-current" />
                Principal
              </Badge>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}