import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, TrendingUp } from "lucide-react";

interface ApprovalStats {
  approved: number;
  rejected: number;
  pending: number;
  total: number;
  approvalRate: number;
  rejectionRate: number;
}

interface StageApprovalRate {
  stageName: string;
  approvalRate: number;
  totalSubmissions: number;
}

interface ApprovalRatesCardProps {
  overallStats: ApprovalStats;
  stageStats: StageApprovalRate[];
  loading?: boolean;
}

export const ApprovalRatesCard = ({ overallStats, stageStats, loading }: ApprovalRatesCardProps) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Índices de Aprovação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Carregando índices...</p>
        </CardContent>
      </Card>
    );
  }

  const getApprovalBadge = (rate: number) => {
    if (rate >= 85) return { variant: "default" as const, color: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200" };
    if (rate >= 70) return { variant: "secondary" as const, color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200" };
    return { variant: "outline" as const, color: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200" };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          Índices de Aprovação
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Resumo Geral */}
        <div className="grid grid-cols-3 gap-3 p-3 rounded-lg bg-muted/50">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-lg font-bold text-green-600">{overallStats.approved}</span>
            </div>
            <p className="text-xs text-muted-foreground">Aprovados</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <XCircle className="h-4 w-4 text-red-600" />
              <span className="text-lg font-bold text-red-600">{overallStats.rejected}</span>
            </div>
            <p className="text-xs text-muted-foreground">Rejeitados</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock className="h-4 w-4 text-yellow-600" />
              <span className="text-lg font-bold text-yellow-600">{overallStats.pending}</span>
            </div>
            <p className="text-xs text-muted-foreground">Pendentes</p>
          </div>
        </div>

        {/* Taxa de Aprovação Geral */}
        <div className="text-center p-3 rounded-lg border">
          <div className="flex items-center justify-center gap-2 mb-1">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span className="text-3xl font-bold text-primary">{overallStats.approvalRate}%</span>
          </div>
          <p className="text-sm font-medium">Taxa de Aprovação Geral</p>
          <p className="text-xs text-muted-foreground">
            {overallStats.total} submissões totais
          </p>
        </div>

        {/* Aprovação por Etapa */}
        {stageStats.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Por Etapa</h4>
            {stageStats.map((stage, index) => {
              const badge = getApprovalBadge(stage.approvalRate);
              return (
                <div key={index} className="flex items-center justify-between p-2 rounded border">
                  <div>
                    <p className="font-medium text-sm">{stage.stageName}</p>
                    <p className="text-xs text-muted-foreground">
                      {stage.totalSubmissions} submissões
                    </p>
                  </div>
                  <Badge variant={badge.variant} className={badge.color}>
                    {stage.approvalRate}%
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};