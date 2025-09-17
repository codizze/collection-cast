import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Scissors, User, Clock, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PrototypingItem {
  id: string;
  productName: string;
  productCode: string;
  collectionName: string;
  stylistName?: string;
  maqueteiraResponsavel?: string;
  expectedDate?: Date;
  status: 'pendente' | 'em_andamento' | 'concluido' | 'atrasado';
  daysRemaining?: number;
}

interface PrototypingStatusCardProps {
  items: PrototypingItem[];
  loading?: boolean;
  onAssignMaqueteira?: (productId: string, maqueteira: string) => void;
}

export const PrototypingStatusCard = ({ items, loading }: PrototypingStatusCardProps) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scissors className="h-5 w-5" />
            Status da Prototipagem
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Carregando status...</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusConfig = (status: PrototypingItem['status']) => {
    switch (status) {
      case 'pendente':
        return {
          color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-200',
          label: 'Pendente',
          icon: Clock
        };
      case 'em_andamento':
        return {
          color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200',
          label: 'Em Andamento',
          icon: Scissors
        };
      case 'concluido':
        return {
          color: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200',
          label: 'Concluído',
          icon: CheckCircle
        };
      case 'atrasado':
        return {
          color: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200',
          label: 'Atrasado',
          icon: Clock
        };
    }
  };

  const stats = {
    pendente: items.filter(item => item.status === 'pendente').length,
    em_andamento: items.filter(item => item.status === 'em_andamento').length,
    concluido: items.filter(item => item.status === 'concluido').length,
    atrasado: items.filter(item => item.status === 'atrasado').length
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scissors className="h-5 w-5" />
          Status da Prototipagem
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Resumo de Status */}
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-2 rounded bg-blue-50 dark:bg-blue-950/20">
            <span className="text-xl font-bold text-blue-600">{stats.em_andamento}</span>
            <p className="text-xs text-blue-700 dark:text-blue-400">Em Andamento</p>
          </div>
          <div className="text-center p-2 rounded bg-gray-50 dark:bg-gray-950/20">
            <span className="text-xl font-bold text-gray-600">{stats.pendente}</span>
            <p className="text-xs text-gray-700 dark:text-gray-400">Pendentes</p>
          </div>
        </div>

        {/* Lista de Itens */}
        {items.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            Nenhum produto na etapa de prototipagem
          </p>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {items.map((item) => {
              const statusConfig = getStatusConfig(item.status);
              const StatusIcon = statusConfig.icon;
              
              return (
                <div key={item.id} className="p-3 rounded-lg border bg-card">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-sm">
                        {item.productCode} - {item.productName}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {item.collectionName}
                      </p>
                    </div>
                    <Badge variant="outline" className={statusConfig.color}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {statusConfig.label}
                    </Badge>
                  </div>

                  <div className="space-y-1 text-xs">
                    {item.stylistName && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span>Modelista: {item.stylistName}</span>
                      </div>
                    )}

                    {item.maqueteiraResponsavel ? (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Scissors className="h-3 w-3" />
                        <span>Maqueteira: {item.maqueteiraResponsavel}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-yellow-600">
                        <Scissors className="h-3 w-3" />
                        <span>Maqueteira não atribuída</span>
                      </div>
                    )}

                    {item.expectedDate && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>
                          Prazo: {format(item.expectedDate, 'dd/MM/yyyy', { locale: ptBR })}
                          {item.daysRemaining !== undefined && (
                            <span className={`ml-1 ${item.daysRemaining < 0 ? 'text-red-600' : item.daysRemaining <= 3 ? 'text-yellow-600' : ''}`}>
                              ({item.daysRemaining < 0 ? 'atrasado' : `${item.daysRemaining}d restantes`})
                            </span>
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {(stats.atrasado > 0 || stats.concluido > 0) && (
          <div className="pt-2 border-t text-xs text-muted-foreground flex justify-between">
            {stats.concluido > 0 && (
              <span className="text-green-600">✓ {stats.concluido} concluídos</span>
            )}
            {stats.atrasado > 0 && (
              <span className="text-red-600">⚠ {stats.atrasado} atrasados</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};