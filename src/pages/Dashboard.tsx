import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, Package, FolderOpen, Palette, Clock, CheckCircle, 
  TrendingUp, Calendar, User, Filter, ClipboardList
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ClientAnalyticsCard } from "@/components/dashboard/ClientAnalyticsCard";
import { ProductionFunnelChart } from "@/components/dashboard/ProductionFunnelChart";
import { CollectionStatusChart } from "@/components/dashboard/CollectionStatusChart";
import { RecentActivityWidget } from "@/components/dashboard/RecentActivityWidget";
import ScheduleTimelineWidget from "@/components/dashboard/ScheduleTimelineWidget";
import { DeliveryPerformanceCard } from "@/components/dashboard/DeliveryPerformanceCard";
import { StylistPerformanceCard } from "@/components/dashboard/StylistPerformanceCard";
import { ApprovalRatesCard } from "@/components/dashboard/ApprovalRatesCard";
import { UrgentAlertsWidget } from "@/components/dashboard/UrgentAlertsWidget";
import { PrototypingStatusCard } from "@/components/dashboard/PrototypingStatusCard";
import { useProductionStages } from "@/hooks/useProductionStages";
import { Button } from "@/components/ui/button";
import { KPICard } from "@/components/dashboard/KPICard";

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

interface DeliveryStats {
  onTime: number;
  delayed: number;
  urgent: number;
  total: number;
}

interface StylistPerformance {
  id: string;
  name: string;
  activeProducts: number;
  completedThisMonth: number;
  averageCompletionDays: number;
  onTimeRate: number;
}

interface ApprovalStats {
  approved: number;
  rejected: number;
  pending: number;
  total: number;
  approvalRate: number;
  rejectionRate: number;
}

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
  
  // Operational dashboard data
  const [deliveryStats, setDeliveryStats] = useState<DeliveryStats>({ onTime: 0, delayed: 0, urgent: 0, total: 0 });
  const [stylistPerformance, setStylistPerformance] = useState<StylistPerformance[]>([]);
  const [approvalStats, setApprovalStats] = useState<ApprovalStats>({ approved: 0, rejected: 0, pending: 0, total: 0, approvalRate: 0, rejectionRate: 0 });
  const [urgentAlerts, setUrgentAlerts] = useState<UrgentAlert[]>([]);
  const [prototypingItems, setPrototypingItems] = useState<PrototypingItem[]>([]);
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
        fetchRecentActivity(),
        fetchOperationalData()
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
    // Fetch all clients with their collections (using LEFT JOIN)
    const { data: topClientsData } = await supabase.from('clients').select(`
      id, name,
      collections(id, status, created_at)
    `);

    const processedClients = topClientsData?.map(client => ({
      id: client.id,
      name: client.name,
      total_collections: client.collections?.length || 0,
      active_collections: client.collections?.filter((c: any) => 
        c.status !== 'concluido' && c.status !== 'concluida'
      ).length || 0,
      last_activity: client.collections && client.collections.length > 0 
        ? client.collections.sort((a: any, b: any) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )[0]?.created_at 
        : new Date().toISOString()
    }))
    .filter(client => client.total_collections > 0)
    .sort((a, b) => b.total_collections - a.total_collections)
    .slice(0, 5) || [];

    setClientAnalytics({
      topClients: processedClients,
      totalActiveClients: processedClients.filter(c => c.active_collections > 0).length,
      averageCollectionsPerClient: processedClients.length > 0 ? 
        processedClients.reduce((sum, c) => sum + c.total_collections, 0) / processedClients.length : 0
    });
  };

  const fetchProductionStages = async () => {
    const { data } = await supabase.from('production_stages').select(`
      stage_name, stage_order, status, product_id
    `);

    if (data) {
      const stageMap = new Map();
      
      // Group by stage_name and count unique products per stage
      data.forEach(stage => {
        const key = stage.stage_name;
        if (!stageMap.has(key)) {
          stageMap.set(key, {
            stage_name: stage.stage_name,
            stage_order: stage.stage_order,
            products: new Set(),
            pending: new Set(),
            in_progress: new Set(),
            completed: new Set()
          });
        }
        
        const stageData = stageMap.get(key);
        stageData.products.add(stage.product_id);
        
        switch (stage.status) {
          case 'pendente':
            stageData.pending.add(stage.product_id);
            break;
          case 'em_andamento':
            stageData.in_progress.add(stage.product_id);
            break;
          case 'concluido':
          case 'concluida':
            stageData.completed.add(stage.product_id);
            break;
        }
      });

      // Convert Sets to counts
      const stages = Array.from(stageMap.values()).map(stage => ({
        stage_name: stage.stage_name,
        product_count: stage.products.size,
        pending: stage.pending.size,
        in_progress: stage.in_progress.size,
        completed: stage.completed.size,
        stage_order: stage.stage_order
      })).sort((a, b) => a.stage_order - b.stage_order);
      
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

  const fetchOperationalData = async () => {
    try {
      // Fetch delivery performance with LEFT JOINs to avoid missing data
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select(`
          id, name, code, status,
          collection_id,
          collections(name, end_date, client_id, clients(name)),
          production_stages(
            id, stage_name, status, expected_date, actual_date, stage_order,
            stylist_id, stylists(name), maqueteira_responsavel
          )
        `)
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;

      // Calculate delivery stats
      let onTime = 0, delayed = 0, urgent = 0, completed = 0;
      const alerts: UrgentAlert[] = [];
      const prototyping: PrototypingItem[] = [];

      products?.forEach(product => {
        // Skip products without production stages or collections
        if (!product.production_stages || !product.collections) return;
        
        // Check if product is completed (all stages done)
        const allStagesCompleted = product.production_stages.every(stage => 
          stage.status === 'concluida' || stage.status === 'concluido'
        );
        
        if (allStagesCompleted) {
          // For completed products, check final delivery performance
          const finalStage = product.production_stages
            .sort((a, b) => b.stage_order - a.stage_order)[0];
          
          if (finalStage?.expected_date && finalStage?.actual_date) {
            const expectedDate = new Date(finalStage.expected_date);
            const actualDate = new Date(finalStage.actual_date);
            
            if (actualDate <= expectedDate) {
              onTime++;
            } else {
              delayed++;
            }
          } else {
            completed++;
          }
        } else {
          // For active products, check current stage
          const currentStage = product.production_stages
            .filter(stage => stage.status === 'em_andamento' || stage.status === 'pendente')
            .sort((a, b) => a.stage_order - b.stage_order)[0];

          if (currentStage?.expected_date) {
            const expectedDate = new Date(currentStage.expected_date);
            const today = new Date();
            const diffTime = expectedDate.getTime() - today.getTime();
            const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (daysRemaining < 0) {
              delayed++;
              alerts.push({
                id: product.id,
                productName: product.name,
                productCode: product.code,
                collectionName: product.collections.name,
                clientName: product.collections.clients.name,
                currentStage: currentStage.stage_name,
                expectedDate,
                daysRemaining,
                stylistName: currentStage.stylists?.name,
                isOverdue: true,
                severity: 'critical'
              });
            } else if (daysRemaining <= 3) {
              urgent++;
              alerts.push({
                id: product.id,
                productName: product.name,
                productCode: product.code,
                collectionName: product.collections.name,
                clientName: product.collections.clients.name,
                currentStage: currentStage.stage_name,
                expectedDate,
                daysRemaining,
                stylistName: currentStage.stylists?.name,
                isOverdue: false,
                severity: daysRemaining <= 1 ? 'urgent' : 'warning'
              });
            } else {
              onTime++;
            }

            // Collect prototipagem items
            if (currentStage.stage_name === 'Prototipagem') {
              prototyping.push({
                id: product.id,
                productName: product.name,
                productCode: product.code,
                collectionName: product.collections.name,
                stylistName: currentStage.stylists?.name,
                maqueteiraResponsavel: currentStage.maqueteira_responsavel,
                expectedDate,
                status: daysRemaining < 0 ? 'atrasado' : currentStage.status === 'em_andamento' ? 'em_andamento' : 'pendente',
                daysRemaining
              });
            }
          }
        }
      });

      setDeliveryStats({ onTime, delayed, urgent, total: onTime + delayed + urgent + completed });
      setUrgentAlerts(alerts.sort((a, b) => a.daysRemaining - b.daysRemaining));
      setPrototypingItems(prototyping);

      // Fetch stylist performance with correct query to get assigned stages
      const { data: allStages, error: stagesError } = await supabase
        .from('production_stages')
        .select(`
          id, status, actual_date, expected_date, created_at, stylist_id,
          stylists(id, name)
        `)
        .not('stylist_id', 'is', null);

      if (stagesError) throw stagesError;

      // Group stages by stylist and calculate performance
      const stylistMap = new Map();
      
      allStages?.forEach(stage => {
        if (!stage.stylists) return;
        
        const stylistId = stage.stylists.id;
        if (!stylistMap.has(stylistId)) {
          stylistMap.set(stylistId, {
            id: stylistId,
            name: stage.stylists.name,
            stages: []
          });
        }
        stylistMap.get(stylistId).stages.push(stage);
      });

      const stylistPerf: StylistPerformance[] = Array.from(stylistMap.values()).map(stylist => {
        const stages = stylist.stages;
        const activeProducts = stages.filter((s: any) => s.status === 'em_andamento').length;
        const completedThisMonth = stages.filter((s: any) => {
          if (!s.actual_date) return false;
          const actualDate = new Date(s.actual_date);
          const now = new Date();
          return actualDate.getMonth() === now.getMonth() && actualDate.getFullYear() === now.getFullYear();
        }).length;

        const completedStages = stages.filter((s: any) => s.actual_date && s.expected_date);
        const onTimeStages = completedStages.filter((s: any) => {
          const actual = new Date(s.actual_date);
          const expected = new Date(s.expected_date);
          return actual <= expected;
        });

        const onTimeRate = completedStages.length > 0 ? Math.round((onTimeStages.length / completedStages.length) * 100) : 0;

        return {
          id: stylist.id,
          name: stylist.name,
          activeProducts,
          completedThisMonth,
          averageCompletionDays: 0, // Calculate if needed
          onTimeRate
        };
      });

      setStylistPerformance(stylistPerf);

      // Calculate approval stats based on approval workflow (Envio para Aprovação -> Aprovado)
      let approvedCount = 0;
      let rejectedCount = 0;
      let pendingApprovalCount = 0;
      
      products?.forEach(product => {
        if (!product.production_stages) return;
        
        // Count stages that went through approval process
        const approvalStage = product.production_stages.find(s => s.stage_name === 'Envio para Aprovação');
        const approvedStage = product.production_stages.find(s => s.stage_name === 'Aprovado');
        
        if (approvedStage?.status === 'concluida') {
          approvedCount++;
        } else if (approvalStage?.status === 'pendente' || approvalStage?.status === 'em_andamento') {
          pendingApprovalCount++;
        }
        // Note: rejectedCount remains 0 as there's no rejection tracking in current system
      });

      const totalApprovalSubmissions = approvedCount + rejectedCount + pendingApprovalCount;

      setApprovalStats({
        approved: approvedCount,
        rejected: rejectedCount,
        pending: pendingApprovalCount,
        total: totalApprovalSubmissions,
        approvalRate: totalApprovalSubmissions > 0 ? Math.round((approvedCount / totalApprovalSubmissions) * 100) : 0,
        rejectionRate: totalApprovalSubmissions > 0 ? Math.round((rejectedCount / totalApprovalSubmissions) * 100) : 0
      });

    } catch (error) {
      console.error('Error fetching operational data:', error);
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

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <KPICard
          title="Clientes"
          value={stats.totalClients}
          icon={Users}
          to="/clients"
          colorScheme="blue"
        />
        <KPICard
          title="Coleções"
          value={stats.totalCollections}
          icon={FolderOpen}
          to="/collections"
          colorScheme="purple"
        />
        <KPICard
          title="Produtos"
          value={stats.totalProducts}
          icon={Package}
          to="/products"
          colorScheme="orange"
        />
        <KPICard
          title="Materiais"
          value={stats.totalMaterials}
          icon={Palette}
          to="/materials"
          colorScheme="gray"
        />
        <KPICard
          title="Tarefas"
          value={stats.totalTasks}
          icon={ClipboardList}
          to="/workflow"
          colorScheme="yellow"
        />
        <KPICard
          title="Modelistas"
          value={stats.totalStylists}
          icon={User}
          to="/stylists"
          colorScheme="green"
        />
      </div>

      {/* Operational Performance Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <DeliveryPerformanceCard 
          stats={deliveryStats} 
          loading={loading} 
        />
        <ApprovalRatesCard 
          overallStats={approvalStats}
          stageStats={[]}
          loading={loading} 
        />
        <div className="lg:col-span-1">
          <PrototypingStatusCard 
            items={prototypingItems}
            loading={loading} 
          />
        </div>
      </div>

      {/* Alerts and Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UrgentAlertsWidget 
          alerts={urgentAlerts}
          loading={loading} 
        />
        <StylistPerformanceCard 
          stylists={stylistPerformance}
          loading={loading} 
        />
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