import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, User, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface UrgentAlert {
  id: string;
  productName: string;
  productCode: string;
  collectionName: string;
  clientName: string;
  currentStage: string;
  expectedDate: Date;
  daysRemaining: number;
  stylistName?: string;
  isOverdue: boolean;
  severity: 'critical' | 'urgent' | 'warning';
}

interface UrgentAlertsWidgetProps {
  alerts: UrgentAlert[];
  loading?: boolean;
  onViewProduct?: (productId: string) => void;
}

export const UrgentAlertsWidget = ({ alerts, loading, onViewProduct }: UrgentAlertsWidgetProps) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Alertas Urgentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Carregando alertas...</p>
        </CardContent>
      </Card>
    );
  }

  const getSeverityConfig = (severity: UrgentAlert['severity']) => {
    switch (severity) {
      case 'critical':
        return {
          bgColor: 'bg-red-50 dark:bg-red-950/30',
          borderColor: 'border-red-200 dark:border-red-800',
          iconColor: 'text-red-600',
          badgeColor: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200',
          label: 'CRÍTICO'
        };
      case 'urgent':
        return {
          bgColor: 'bg-orange-50 dark:bg-orange-950/30',
          borderColor: 'border-orange-200 dark:border-orange-800',
          iconColor: 'text-orange-600',
          badgeColor: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200',
          label: 'URGENTE'
        };
      case 'warning':
        return {
          bgColor: 'bg-yellow-50 dark:bg-yellow-950/30',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          iconColor: 'text-yellow-600',
          badgeColor: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200',
          label: 'ATENÇÃO'
        };
    }
  };

  const criticalAlerts = alerts.filter(a => a.severity === 'critical').length;
  const urgentAlerts = alerts.filter(a => a.severity === 'urgent').length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Alertas Urgentes
          </div>
          {alerts.length > 0 && (
            <div className="flex gap-1">
              {criticalAlerts > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {criticalAlerts} críticos
                </Badge>
              )}
              {urgentAlerts > 0 && (
                <Badge variant="outline" className="text-xs bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200">
                  {urgentAlerts} urgentes
                </Badge>
              )}
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-6">
            <Clock className="h-12 w-12 text-green-500 mx-auto mb-2" />
            <p className="text-green-600 font-medium">Tudo em dia!</p>
            <p className="text-sm text-muted-foreground">Nenhum alerta urgente no momento</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {alerts.map((alert) => {
              const config = getSeverityConfig(alert.severity);
              return (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg border ${config.bgColor} ${config.borderColor} ${
                    alert.severity === 'critical' ? 'animate-pulse' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className={`h-4 w-4 ${config.iconColor}`} />
                      <span className="font-medium text-sm">
                        {alert.productCode} - {alert.productName}
                      </span>
                    </div>
                    <Badge variant="outline" className={`text-xs ${config.badgeColor}`}>
                      {config.label}
                    </Badge>
                  </div>

                  <div className="space-y-1 text-xs text-muted-foreground mb-3">
                    <div className="flex items-center gap-2">
                      <span>📁 {alert.collectionName}</span>
                      <span>•</span>
                      <span>🏢 {alert.clientName}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {alert.isOverdue ? 'Atrasado há' : 'Entrega em'} {Math.abs(alert.daysRemaining)} dia(s)
                      </span>
                      <span>•</span>
                      <span>{format(alert.expectedDate, 'dd/MM', { locale: ptBR })}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span>📍 {alert.currentStage}</span>
                      {alert.stylistName && (
                        <>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>{alert.stylistName}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {onViewProduct && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full text-xs"
                      onClick={() => onViewProduct(alert.id)}
                    >
                      Ver Produto
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};