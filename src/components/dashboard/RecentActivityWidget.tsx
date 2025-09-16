import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface RecentActivity {
  client_name: string;
  collection_name: string;
  created_at: string;
  status: string;
}

interface RecentActivityWidgetProps {
  activities: RecentActivity[];
  loading: boolean;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'planejamento': return 'bg-primary/10 text-primary border-primary/20';
    case 'desenvolvimento': return 'bg-fashion-elegant/10 text-fashion-elegant border-fashion-elegant/20';  
    case 'producao': return 'bg-fashion-warning/10 text-fashion-warning border-fashion-warning/20';
    case 'concluido': return 'bg-fashion-success/10 text-fashion-success border-fashion-success/20';
    default: return 'bg-muted/10 text-muted-foreground border-muted/20';
  }
};

export const RecentActivityWidget = ({ activities, loading }: RecentActivityWidgetProps) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-fashion-warning" />
            Atividade Recente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">Carregando atividades...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-fashion-warning" />
          Atividade Recente
        </CardTitle>
        <CardDescription>
          Últimas coleções criadas (30 dias)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <div className="text-center text-muted-foreground py-4">
              <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Nenhuma atividade recente</p>
            </div>
          ) : (
            activities.map((activity, index) => (
              <div key={index} className="flex items-start justify-between space-x-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium truncate">
                      {activity.collection_name}
                    </p>
                    <Badge 
                      variant="outline" 
                      className={getStatusColor(activity.status)}
                    >
                      {activity.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {activity.client_name}
                  </p>
                </div>
                <div className="flex-shrink-0 text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(activity.created_at), { 
                    addSuffix: true, 
                    locale: ptBR 
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};