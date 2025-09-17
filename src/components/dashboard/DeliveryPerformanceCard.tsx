import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, AlertTriangle } from "lucide-react";

interface DeliveryStats {
  onTime: number;
  delayed: number;
  urgent: number;
  total: number;
}

interface DeliveryPerformanceCardProps {
  stats: DeliveryStats;
  loading?: boolean;
}

export const DeliveryPerformanceCard = ({ stats, loading }: DeliveryPerformanceCardProps) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Performance de Entrega
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Carregando métricas...</p>
        </CardContent>
      </Card>
    );
  }

  const onTimeRate = stats.total > 0 ? Math.round((stats.onTime / stats.total) * 100) : 0;
  const delayedRate = stats.total > 0 ? Math.round((stats.delayed / stats.total) * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Performance de Entrega
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
            <div className="flex items-center justify-center gap-1 mb-1">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-2xl font-bold text-green-600">{onTimeRate}%</span>
            </div>
            <p className="text-sm text-green-700 dark:text-green-400">No Prazo</p>
            <p className="text-xs text-muted-foreground">{stats.onTime} produtos</p>
          </div>
          
          <div className="text-center p-3 rounded-lg bg-red-50 dark:bg-red-950/20">
            <div className="flex items-center justify-center gap-1 mb-1">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-2xl font-bold text-red-600">{delayedRate}%</span>
            </div>
            <p className="text-sm text-red-700 dark:text-red-400">Atrasados</p>
            <p className="text-xs text-muted-foreground">{stats.delayed} produtos</p>
          </div>
        </div>

        {stats.urgent > 0 && (
          <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="font-medium text-yellow-800 dark:text-yellow-200">Urgente</span>
              </div>
              <Badge variant="outline" className="bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200">
                {stats.urgent} produtos
              </Badge>
            </div>
            <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
              Entrega em menos de 3 dias
            </p>
          </div>
        )}

        <div className="pt-2 border-t">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total de Produtos:</span>
            <span className="font-medium">{stats.total}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};