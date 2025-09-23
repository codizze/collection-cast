import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Settings, Calendar, Zap, RotateCcw } from 'lucide-react';
import { useProductionConfig } from '@/hooks/useProductionConfig';

const ProductionConfig = () => {
  const { configs, isLoading, updateConfig, recalculateAllSchedules } = useProductionConfig();
  const [isRecalculating, setIsRecalculating] = useState(false);

  const handleUpdateDuration = async (id: string, newDuration: number) => {
    if (newDuration < 1) return;
    await updateConfig(id, { duration_days: newDuration });
  };

  const handleUpdateMultiplier = async (id: string, newMultiplier: number) => {
    if (newMultiplier < 0.1 || newMultiplier > 5) return;
    await updateConfig(id, { priority_multiplier: newMultiplier });
  };

  const handleRecalculateSchedules = async () => {
    setIsRecalculating(true);
    await recalculateAllSchedules();
    setIsRecalculating(false);
  };

  const getStageOrder = (stageName: string): number => {
    const order = {
      'Briefing Recebido': 1,
      'Modelagem Técnica': 2,
      'Prototipagem': 3,
      'Envio para Aprovação': 4,
      'Aprovado': 5,
      'Mostruário e Entregue': 6
    };
    return order[stageName as keyof typeof order] || 999;
  };

  const sortedConfigs = [...configs].sort((a, b) => 
    getStageOrder(a.stage_name) - getStageOrder(b.stage_name)
  );

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-accent/20 rounded w-1/3"></div>
          <div className="h-96 bg-accent/20 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Settings className="h-8 w-8 text-primary" />
            Configurações de Produção
          </h1>
          <p className="text-muted-foreground mt-2">
            Configure a duração e multiplicadores de cada estágio de produção
          </p>
        </div>
        
        <Button 
          onClick={handleRecalculateSchedules}
          disabled={isRecalculating}
          className="flex items-center gap-2"
        >
          <RotateCcw className={`h-4 w-4 ${isRecalculating ? 'animate-spin' : ''}`} />
          {isRecalculating ? 'Recalculando...' : 'Recalcular Cronogramas'}
        </Button>
      </div>

      {/* Configuration Cards */}
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Duração dos Estágios
            </CardTitle>
            <CardDescription>
              Configure quantos dias cada estágio deve durar por padrão
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {sortedConfigs.map((config, index) => (
              <div key={config.id}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center text-xs">
                      {getStageOrder(config.stage_name)}
                    </Badge>
                    <span className="font-medium">{config.stage_name}</span>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`duration-${config.id}`} className="text-xs">
                      Duração (dias)
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id={`duration-${config.id}`}
                        type="number"
                        min="1"
                        max="30"
                        value={config.duration_days}
                        onChange={(e) => {
                          const newValue = parseInt(e.target.value);
                          if (!isNaN(newValue)) {
                            handleUpdateDuration(config.id, newValue);
                          }
                        }}
                        className="w-20"
                      />
                      <span className="text-xs text-muted-foreground">dias</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`multiplier-${config.id}`} className="text-xs">
                      Multiplicador de Prioridade
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id={`multiplier-${config.id}`}
                        type="number"
                        min="0.1"
                        max="5"
                        step="0.1"
                        value={config.priority_multiplier}
                        onChange={(e) => {
                          const newValue = parseFloat(e.target.value);
                          if (!isNaN(newValue)) {
                            handleUpdateMultiplier(config.id, newValue);
                          }
                        }}
                        className="w-20"
                      />
                      <span className="text-xs text-muted-foreground">×</span>
                    </div>
                  </div>
                </div>
                
                {index < sortedConfigs.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-gradient-subtle border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Zap className="h-5 w-5" />
              Como Funciona
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Duração dos Estágios</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Define quantos dias cada estágio deve durar</li>
                  <li>• Usado para calcular datas de entrega</li>
                  <li>• Considera apenas dias úteis</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Multiplicador de Prioridade</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Ajusta duração baseado na prioridade</li>
                  <li>• Prioridade alta: multiplicador menor</li>
                  <li>• Prioridade baixa: multiplicador maior</li>
                </ul>
              </div>
            </div>
            <Separator />
            <p className="text-xs text-muted-foreground">
              <strong>Dica:</strong> Após alterar as configurações, clique em "Recalcular Cronogramas" 
              para aplicar as mudanças a todos os produtos existentes.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProductionConfig;