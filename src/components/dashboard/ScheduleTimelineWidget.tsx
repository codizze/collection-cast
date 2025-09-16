import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, AlertTriangle, RefreshCw } from 'lucide-react';
import { format, isAfter, isBefore, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ProductWithStage {
  id: string;
  name: string;
  code: string;
  collection: { name: string };
  client: { name: string };
  currentStage?: {
    stage_name: string;
    expected_date?: string;
    status: string;
  };
}

interface ScheduleTimelineWidgetProps {
  products: ProductWithStage[];
  onRecalculateAll: () => Promise<boolean>;
  loading?: boolean;
}

const ScheduleTimelineWidget: React.FC<ScheduleTimelineWidgetProps> = ({
  products,
  onRecalculateAll,
  loading = false
}) => {
  // Filtrar produtos com datas esperadas nos próximos 14 dias
  const upcomingProducts = products
    .filter(product => 
      product.currentStage?.expected_date && 
      product.currentStage.status !== 'concluida'
    )
    .map(product => ({
      ...product,
      expectedDate: new Date(product.currentStage!.expected_date!)
    }))
    .filter(product => {
      const today = new Date();
      const twoWeeksFromNow = addDays(today, 14);
      return isAfter(product.expectedDate, today) && isBefore(product.expectedDate, twoWeeksFromNow);
    })
    .sort((a, b) => a.expectedDate.getTime() - b.expectedDate.getTime())
    .slice(0, 10);

  // Produtos em atraso
  const overdueProducts = products
    .filter(product => {
      if (!product.currentStage?.expected_date || product.currentStage.status === 'concluida') {
        return false;
      }
      const expectedDate = new Date(product.currentStage.expected_date);
      const today = new Date();
      return isBefore(expectedDate, today);
    })
    .length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'em_andamento':
        return 'bg-blue-500';
      case 'concluida':
        return 'bg-green-500';
      case 'pendente':
        return 'bg-yellow-500';
      case 'atrasada':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatDate = (date: Date) => {
    return format(date, "dd 'de' MMM", { locale: ptBR });
  };

  const isUrgent = (date: Date) => {
    const today = new Date();
    const daysDiff = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff <= 3;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Cronograma de Produção
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={onRecalculateAll}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Recalcular
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Alertas de produtos em atraso */}
        {overdueProducts > 0 && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span className="text-sm font-medium text-red-800">
              {overdueProducts} produto{overdueProducts > 1 ? 's' : ''} em atraso
            </span>
          </div>
        )}

        {/* Timeline dos próximos produtos */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">
            Próximas Entregas (14 dias)
          </h4>
          
          {upcomingProducts.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma entrega prevista nos próximos 14 dias
            </p>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {upcomingProducts.map((product) => (
                <div
                  key={product.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    isUrgent(product.expectedDate) 
                      ? 'bg-orange-50 border-orange-200' 
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium truncate">
                        {product.name}
                      </p>
                      {isUrgent(product.expectedDate) && (
                        <AlertTriangle className="h-4 w-4 text-orange-600 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {product.collection.name} • {product.client.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {product.currentStage?.stage_name}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatDate(product.expectedDate)}
                    </div>
                    <div className={`w-2 h-2 rounded-full mt-1 ${getStatusColor(product.currentStage?.status || '')}`} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ScheduleTimelineWidget;