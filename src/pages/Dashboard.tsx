import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, Package, FolderOpen, Palette, Clock, CheckCircle, 
  TrendingUp, Calendar, User, Filter
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ClientAnalyticsCard } from "@/components/dashboard/ClientAnalyticsCard";
import { ProductionFunnelChart } from "@/components/dashboard/ProductionFunnelChart";
import { CollectionStatusChart } from "@/components/dashboard/CollectionStatusChart";
import { RecentActivityWidget } from "@/components/dashboard/RecentActivityWidget";
import ScheduleTimelineWidget from "@/components/dashboard/ScheduleTimelineWidget";
import { useProductionStages } from "@/hooks/useProductionStages";
import { Button } from "@/components/ui/button";

interface DashboardStats {
  totalClients: number;
  totalCollections: number;
  totalProducts: number;
  totalMaterials: number;
  totalTasks: number;
  totalStylists: number;
}

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

interface ProductionStage {
  stage_name: string;
  product_count: number;
  pending: number;
  in_progress: number;
  completed: number;
}

interface CollectionStatus {
  status: string;
  count: number;
}

interface RecentActivity {
  client_name: string;
  collection_name: string;
  created_at: string;
  status: string;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    totalCollections: 0,
    totalProducts: 0,
    totalMaterials: 0,
    totalTasks: 0,
    totalStylists: 0
  });
  const [clientAnalytics, setClientAnalytics] = useState<ClientAnalytics>({
    topClients: [],
    totalActiveClients: 0,
    averageCollectionsPerClient: 0
  });
  const [productionStages, setProductionStages] = useState<ProductionStage[]>([]);
  const [collectionStatus, setCollectionStatus] = useState<CollectionStatus[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const { toast } = useToast();

  const { 
    products, 
    loading: productionLoading, 
    isOverdue,
    recalculateAllSchedules,
    scheduleLoading
  } = useProductionStages();

  useEffect(() => {
    fetchAllDashboardData();
  }, []);

  const fetchAllDashboardData = async () => {
    try {
      await Promise.all([
        fetchBasicStats(),
        fetchClientAnalytics(),
        fetchProductionStages(),
        fetchCollectionStatus(),
        fetchRecentActivity()
      ]);
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do dashboard.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setAnalyticsLoading(false);
    }
  };

  const fetchBasicStats = async () => {
    const [
      clientsRes, collectionsRes, productsRes, materialsRes, tasksRes, stylistsRes
    ] = await Promise.all([
      supabase.from('clients').select('id', { count: 'exact' }),
      supabase.from('collections').select('id', { count: 'exact' }),
      supabase.from('products').select('id', { count: 'exact' }),
      supabase.from('materials').select('id', { count: 'exact' }),
      supabase.from('tasks').select('id', { count: 'exact' }),
      supabase.from('stylists').select('id', { count: 'exact' })
    ]);

    setStats({
      totalClients: clientsRes.count || 0,
      totalCollections: collectionsRes.count || 0,
      totalProducts: productsRes.count || 0,
      totalMaterials: materialsRes.count || 0,
      totalTasks: tasksRes.count || 0,
      totalStylists: stylistsRes.count || 0
    });
  };

  const fetchClientAnalytics = async () => {
    // Fetch top clients with collections
    const { data: topClientsData } = await supabase.from('clients').select(`
      id, name,
      collections!inner(id, status, created_at)
    `);

    const processedClients = topClientsData?.map(client => ({
      id: client.id,
      name: client.name,
      total_collections: client.collections.length,
      active_collections: client.collections.filter((c: any) => c.status !== 'concluido').length,
      last_activity: client.collections.sort((a: any, b: any) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0]?.created_at || new Date().toISOString()
    })).sort((a, b) => b.total_collections - a.total_collections).slice(0, 5) || [];

    setClientAnalytics({
      topClients: processedClients,
      totalActiveClients: processedClients.filter(c => c.active_collections > 0).length,
      averageCollectionsPerClient: processedClients.length > 0 ? 
        processedClients.reduce((sum, c) => sum + c.total_collections, 0) / processedClients.length : 0
    });
  };

  const fetchProductionStages = async () => {
    const { data } = await supabase.from('production_stages').select(`
      stage_name, stage_order, status
    `);

    if (data) {
      const stageMap = new Map();
      data.forEach(stage => {
        const key = stage.stage_name;
        if (!stageMap.has(key)) {
          stageMap.set(key, {
            stage_name: stage.stage_name,
            product_count: 0,
            pending: 0,
            in_progress: 0,
            completed: 0,
            stage_order: stage.stage_order
          });
        }
        
        const stageData = stageMap.get(key);
        stageData.product_count++;
        
        switch (stage.status) {
          case 'pendente':
            stageData.pending++;
            break;
          case 'em_andamento':
            stageData.in_progress++;
            break;
          case 'concluido':
            stageData.completed++;
            break;
        }
      });

      const stages = Array.from(stageMap.values()).sort((a, b) => a.stage_order - b.stage_order);
      setProductionStages(stages);
    }
  };

  const fetchCollectionStatus = async () => {
    const { data } = await supabase.from('collections').select('status');
    
    if (data) {
      const statusMap = new Map();
      data.forEach(collection => {
        const status = collection.status;
        statusMap.set(status, (statusMap.get(status) || 0) + 1);
      });

      const statusArray = Array.from(statusMap.entries()).map(([status, count]) => ({
        status,
        count
      }));
      
      setCollectionStatus(statusArray);
    }
  };

  const fetchRecentActivity = async () => {
    const { data } = await supabase
      .from('collections')
      .select(`
        name, created_at, status,
        clients(name)
      `)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(10);

    if (data) {
      const activities = data.map(collection => ({
        collection_name: collection.name,
        client_name: (collection.clients as any)?.name || 'Cliente desconhecido',
        created_at: collection.created_at,
        status: collection.status
      }));
      
      setRecentActivity(activities);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-lg">Carregando dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Visão geral do sistema de gerenciamento de coleções
          </p>
        </div>
        <Button variant="outline" onClick={fetchAllDashboardData} disabled={loading}>
          <Filter className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Basic Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClients}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Coleções</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCollections}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Materiais</CardTitle>
            <Palette className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMaterials}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tarefas</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTasks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Modelistas</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStylists}</div>
          </CardContent>
        </Card>
      </div>

      {/* Client Analytics Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-fashion-elegant">Analytics de Clientes</h2>
        <ClientAnalyticsCard analytics={clientAnalytics} loading={analyticsLoading} />
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <CollectionStatusChart data={collectionStatus} loading={analyticsLoading} />
        <RecentActivityWidget activities={recentActivity} loading={analyticsLoading} />
      </div>

      {/* Cronograma Timeline */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-primary">Cronograma de Produção</h2>
        <ScheduleTimelineWidget 
          products={products.map(p => ({
            id: p.id,
            name: p.name,
            code: p.code,
            collection: { name: p.collection_name || 'Sem coleção' },
            client: { name: p.client_name || 'Sem cliente' },
            currentStage: p.current_stage ? {
              stage_name: p.current_stage.stage_name,
              expected_date: p.current_stage.expected_date,
              status: p.current_stage.status
            } : undefined
          }))}
          onRecalculateAll={recalculateAllSchedules}
          loading={scheduleLoading}
        />
      </div>

      {/* Production Funnel */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-primary">Monitoramento de Produção</h2>
        <ProductionFunnelChart data={productionStages} loading={analyticsLoading} />
      </div>

      {/* Insights Section */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-fashion-elegant/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-fashion-elegant">Insights Estratégicos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-1">{clientAnalytics.topClients.length > 0 ? '✅' : '⚠️'}</div>
            <p className="text-xs text-muted-foreground">
              {clientAnalytics.topClients.length > 0 
                ? `${clientAnalytics.topClients[0]?.name} é seu cliente mais ativo`
                : 'Nenhum cliente ativo encontrado'
              }
            </p>
          </CardContent>
        </Card>

        <Card className="border-fashion-success/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-fashion-success">Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-1 text-fashion-success">
              {clientAnalytics.averageCollectionsPerClient.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              Média de coleções por cliente
            </p>
          </CardContent>
        </Card>

        <Card className="border-fashion-warning/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-fashion-warning">Oportunidades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-1 text-fashion-warning">
              {stats.totalClients - clientAnalytics.totalActiveClients}
            </div>
            <p className="text-xs text-muted-foreground">
              Clientes sem coleções ativas
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;