import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp, Clock } from "lucide-react";

interface StylistPerformance {
  id: string;
  name: string;
  activeProducts: number;
  completedThisMonth: number;
  averageCompletionDays: number;
  onTimeRate: number;
}

interface StylistPerformanceCardProps {
  stylists: StylistPerformance[];
  loading?: boolean;
}

export const StylistPerformanceCard = ({ stylists, loading }: StylistPerformanceCardProps) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Performance dos Modelistas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Carregando performance...</p>
        </CardContent>
      </Card>
    );
  }

  const getPerformanceBadge = (onTimeRate: number) => {
    if (onTimeRate >= 90) return { variant: "default" as const, color: "text-green-600", label: "Excelente" };
    if (onTimeRate >= 70) return { variant: "secondary" as const, color: "text-yellow-600", label: "Bom" };
    return { variant: "outline" as const, color: "text-red-600", label: "Atenção" };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Performance dos Modelistas
        </CardTitle>
      </CardHeader>
      <CardContent>
        {stylists.length === 0 ? (
          <p className="text-muted-foreground">Nenhum modelista ativo</p>
        ) : (
          <div className="space-y-4">
            {stylists.map((stylist) => {
              const badge = getPerformanceBadge(stylist.onTimeRate);
              return (
                <div key={stylist.id} className="p-3 rounded-lg border bg-card">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{stylist.name}</h4>
                    <Badge variant={badge.variant} className={badge.color}>
                      {badge.label}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        <span className="font-semibold">{stylist.activeProducts}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Ativos</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span className="font-semibold">{stylist.completedThisMonth}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Concluídos</p>
                    </div>
                    
                    <div className="text-center">
                      <span className="font-semibold text-lg">{stylist.onTimeRate}%</span>
                      <p className="text-xs text-muted-foreground">No Prazo</p>
                    </div>
                  </div>
                  
                  {stylist.averageCompletionDays > 0 && (
                    <div className="mt-2 pt-2 border-t text-xs text-muted-foreground">
                      Média: {stylist.averageCompletionDays} dias por produto
                    </div>
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