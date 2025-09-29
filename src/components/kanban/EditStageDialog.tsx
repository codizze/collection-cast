import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface EditStageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stage: {
    id: string;
    stage_name: string;
    status: string;
    expected_date?: string;
    actual_date?: string;
    maqueteira_responsavel?: string;
    notes?: string;
  } | null;
  productId: string;
  onStageUpdated: () => void;
}

export function EditStageDialog({ 
  open, 
  onOpenChange, 
  stage, 
  productId, 
  onStageUpdated 
}: EditStageDialogProps) {
  const [status, setStatus] = useState("");
  const [expectedDate, setExpectedDate] = useState<Date>();
  const [actualDate, setActualDate] = useState<Date>();
  const [maqueteiraResponsavel, setMaqueteiraResponsavel] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (stage) {
      setStatus(stage.status);
      setExpectedDate(stage.expected_date ? new Date(stage.expected_date) : undefined);
      setActualDate(stage.actual_date ? new Date(stage.actual_date) : undefined);
      setMaqueteiraResponsavel(stage.maqueteira_responsavel || "");
      setNotes(stage.notes || "");
    }
  }, [stage]);

  const handleSave = async () => {
    if (!stage) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('production_stages')
        .update({
          status,
          expected_date: expectedDate ? expectedDate.toISOString().split('T')[0] : null,
          actual_date: actualDate ? actualDate.toISOString().split('T')[0] : null,
          maqueteira_responsavel: maqueteiraResponsavel || null,
          notes: notes || null,
        })
        .eq('id', stage.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Estágio atualizado com sucesso",
      });

      onStageUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating stage:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar estágio",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Estágio: {stage?.stage_name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="em_andamento">Em Andamento</SelectItem>
                <SelectItem value="concluida">Concluída</SelectItem>
                <SelectItem value="atrasada">Atrasada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Data Prevista</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !expectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {expectedDate ? format(expectedDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={expectedDate}
                  onSelect={setExpectedDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Data Realizada</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !actualDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {actualDate ? format(actualDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={actualDate}
                  onSelect={setActualDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maqueteira">Maqueteira Responsável</Label>
            <Input
              id="maqueteira"
              value={maqueteiraResponsavel}
              onChange={(e) => setMaqueteiraResponsavel(e.target.value)}
              placeholder="Nome da maqueteira responsável"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observações sobre este estágio"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}