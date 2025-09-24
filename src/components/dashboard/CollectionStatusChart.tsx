import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import { FolderOpen } from "lucide-react";

interface StatusData {
  status: string;
  count: number;
}

interface CollectionStatusChartProps {
  data: StatusData[];
  loading: boolean;
}

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--fashion-elegant))", 
  "hsl(var(--fashion-success))",
  "hsl(var(--fashion-warning))",
  "hsl(var(--muted))"
];

const chartConfig = {
  planejamento: {
    label: "Planejamento",
    color: "hsl(var(--primary))",
  },
  desenvolvimento: {
    label: "Desenvolvimento", 
    color: "hsl(var(--fashion-elegant))",
  },
  producao: {
    label: "Produção",
    color: "hsl(var(--fashion-warning))",
  },
  concluido: {
    label: "Concluído",
    color: "hsl(var(--fashion-success))",
  },
};

export const CollectionStatusChart = ({ data, loading }: CollectionStatusChartProps) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-fashion-elegant" />
            Status das Coleções
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-muted-foreground">Carregando status...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const transformedData = data.map(item => ({
    name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
    value: item.count,
    status: item.status
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FolderOpen className="h-5 w-5 text-fashion-elegant" />
          Status das Coleções
        </CardTitle>
        <CardDescription>
          Distribuição das coleções por status atual
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={transformedData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }: { name?: string; percent?: number }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {transformedData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={chartConfig[entry.status as keyof typeof chartConfig]?.color || COLORS[index % COLORS.length]} 
                  />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};