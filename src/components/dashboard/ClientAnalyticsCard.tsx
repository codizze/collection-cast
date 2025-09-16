import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, Building2, Activity } from "lucide-react";

interface ClientAnalytics {
  topClients: Array<{
    name: string;
    id: string;
    total_collections: number;
    active_collections: number;
    last_activity: string;
  }>;
  totalActiveClients: number;
  averageCollectionsPerClient: number;
}

interface ClientAnalyticsCardProps {
  analytics: ClientAnalytics;
  loading: boolean;
}

export const ClientAnalyticsCard = ({ analytics, loading }: ClientAnalyticsCardProps) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-fashion-elegant" />
            Analytics de Clientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">Carregando analytics...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Top Clients Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top Clientes</CardTitle>
          <Building2 className="h-4 w-4 text-fashion-elegant" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {analytics.topClients.slice(0, 3).map((client, index) => (
              <div key={client.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center">
                    {index + 1}
                  </Badge>
                  <span className="text-sm font-medium">{client.name}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {client.total_collections} coleções
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Clients Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
          <Activity className="h-4 w-4 text-fashion-success" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-fashion-success">{analytics.totalActiveClients}</div>
          <p className="text-xs text-muted-foreground">
            Com coleções em andamento
          </p>
        </CardContent>
      </Card>

      {/* Average Collections Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Média por Cliente</CardTitle>
          <TrendingUp className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics.averageCollectionsPerClient.toFixed(1)}</div>
          <p className="text-xs text-muted-foreground">
            Coleções por cliente
          </p>
        </CardContent>
      </Card>

      {/* Most Active Client Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Mais Ativo</CardTitle>
          <Users className="h-4 w-4 text-fashion-warning" />
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold text-fashion-warning">
            {analytics.topClients[0]?.name || "N/A"}
          </div>
          <p className="text-xs text-muted-foreground">
            {analytics.topClients[0]?.total_collections || 0} coleções totais
          </p>
        </CardContent>
      </Card>
    </div>
  );
};