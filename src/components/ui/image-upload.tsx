import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, X, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string | undefined) => void;
  onUpload: (file: File) => Promise<string>;
  className?: string;
}

export function ImageUpload({ value, onChange, onUpload, className }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      return;
    }

    setUploading(true);
    try {
      const url = await onUpload(file);
      onChange(url);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const removeImage = () => {
    onChange(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card
      className={cn(
        "border-2 border-dashed transition-colors",
        dragActive && "border-primary bg-primary/5",
        className
      )}
      onDragEnter={() => setDragActive(true)}
      onDragLeave={() => setDragActive(false)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      {value ? (
        <div className="relative group">
          <img
            src={value}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={removeImage}
              disabled={uploading}
            >
              <X className="h-4 w-4 mr-2" />
              Remover
            </Button>
          </div>
        </div>
      ) : (
        <div
          className="p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors rounded-lg"
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? (
            <div className="space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground">Enviando imagem...</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                <ImageIcon className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">Clique para enviar uma imagem</p>
                <p className="text-xs text-muted-foreground">ou arraste e solte aqui</p>
              </div>
              <Button type="button" variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Selecionar Imagem
              </Button>
            </div>
          )}
        </div>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="hidden"
      />
    </Card>
  );
}