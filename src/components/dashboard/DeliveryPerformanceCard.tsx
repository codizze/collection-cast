import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from "recharts";
import { Clock } from "lucide-react";

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

const COLORS = {
  onTime: "hsl(142, 76%, 36%)", // Green
  delayed: "hsl(0, 84%, 60%)", // Red
};

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

  const onTimePercentage = stats.total > 0 ? ((stats.onTime / stats.total) * 100).toFixed(1) : 0;
  const delayedPercentage = stats.total > 0 ? ((stats.delayed / stats.total) * 100).toFixed(1) : 0;

  const chartData = [
    { name: "No Prazo", value: stats.onTime, fill: COLORS.onTime },
    { name: "Atrasado", value: stats.delayed, fill: COLORS.delayed },
  ];

  const chartConfig = {
    onTime: {
      label: "No Prazo",
      color: COLORS.onTime,
    },
    delayed: {
      label: "Atrasado",
      color: COLORS.delayed,
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Performance de Entrega
        </CardTitle>
        <CardDescription>
          Total de produtos: {stats.total}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {stats.total === 0 ? (
          <div className="h-[250px] flex items-center justify-center">
            <p className="text-muted-foreground">Nenhum produto encontrado</p>
          </div>
        ) : (
          <>
            <ChartContainer config={chartConfig} className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => {
                      const percentValue = typeof percent === 'number' ? percent * 100 : 0;
                      return `${name}: ${percentValue.toFixed(1)}%`;
                    }}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="mt-4 grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold" style={{ color: COLORS.onTime }}>
                  {onTimePercentage}%
                </p>
                <p className="text-sm text-muted-foreground">No Prazo ({stats.onTime})</p>
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: COLORS.delayed }}>
                  {delayedPercentage}%
                </p>
                <p className="text-sm text-muted-foreground">Atrasado ({stats.delayed})</p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};