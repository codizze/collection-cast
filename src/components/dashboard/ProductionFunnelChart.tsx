import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { ClipboardList } from "lucide-react";

interface ProductionStage {
  stage_name: string;
  product_count: number;
  pending: number;
  in_progress: number;
  completed: number;
}

interface ProductionFunnelChartProps {
  data: ProductionStage[];
  loading: boolean;
}

const chartConfig = {
  pending: {
    label: "Pendente",
    color: "hsl(var(--fashion-warning))",
  },
  in_progress: {
    label: "Em Andamento", 
    color: "hsl(var(--primary))",
  },
  completed: {
    label: "Concluído",
    color: "hsl(var(--fashion-success))",
  },
};

export const ProductionFunnelChart = ({ data, loading }: ProductionFunnelChartProps) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            Funil de Produção
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-muted-foreground">Carregando dados de produção...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const transformedData = data.map(stage => ({
    stage: stage.stage_name.replace(/\s+/g, '\n'), // Break long names
    Pendente: stage.pending,
    "Em Andamento": stage.in_progress,
    Concluído: stage.completed,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-primary" />
          Funil de Produção
        </CardTitle>
        <CardDescription>
          Status dos produtos em cada etapa da produção
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={transformedData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="stage" 
                tick={{ fontSize: 12 }}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={80}
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="Concluído" stackId="a" fill="var(--color-completed)" />
              <Bar dataKey="Em Andamento" stackId="a" fill="var(--color-in_progress)" />
              <Bar dataKey="Pendente" stackId="a" fill="var(--color-pending)" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};