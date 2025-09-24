import { useState, useEffect } from "react";
import { X, AlertTriangle, CheckCircle, Clock, Calendar, BarChart3, TrendingUp, Filter, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface ProductWithStage {
  id: string;
  name: string;
  code: string;
  image_url?: string;
  collection_name?: string;
  client_name?: string;
  priority?: string;
  status: string;
  created_at: string;
  current_stage: {
    stage_name: string;
    expected_date?: string;
    actual_date?: string;
    status: string;
  };
  files: any[];
}

interface TVModeProps {
  products: ProductWithStage[];
  stages: string[];
  getProductsByStage: (stageName: string) => ProductWithStage[];
  isOverdue: (product: ProductWithStage) => boolean;
  onExitTVMode: () => void;
}

export function TVMode({ 
  products, 
  stages, 
  getProductsByStage, 
  isOverdue, 
  onExitTVMode 
}: TVModeProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentView, setCurrentView] = useState(0);
  const [selectedStage, setSelectedStage] = useState<string>("all");
  const [autoRotate, setAutoRotate] = useState(true);

  const views = [
    { name: 'Dashboard', component: DashboardView },
    { name: 'Produção por Estágio', component: StageView },
    { name: 'Alertas de Prazo', component: AlertsView },
    { name: 'Métricas de Performance', component: MetricsView }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    let viewTimer: NodeJS.Timeout | null = null;
    
    if (autoRotate) {
      viewTimer = setInterval(() => {
        setCurrentView(prev => (prev + 1) % views.length);
      }, 20000); // Change view every 20 seconds
    }

    return () => {
      clearInterval(timer);
      if (viewTimer) clearInterval(viewTimer);
    };
  }, [views.length, autoRotate]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Não definido';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'concluida':
        return 'bg-green-500';
      case 'em_andamento':
        return 'bg-blue-500';
      case 'atrasada':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const CurrentView = views[currentView].component;

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center p-6 bg-gradient-primary text-white shadow-elegant">
        <div className="flex items-center gap-8">
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <BarChart3 className="w-10 h-10" />
            Fashion Factory TV
          </h1>
          <div className="flex items-center gap-4">
            <Calendar className="w-6 h-6" />
            <span className="text-xl">
              {currentTime.toLocaleDateString('pt-BR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          {/* Stage Selector */}
          <Select value={selectedStage} onValueChange={setSelectedStage}>
            <SelectTrigger className="w-48 bg-white text-black">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filtrar por estágio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Estágios</SelectItem>
              {stages.map(stage => (
                <SelectItem key={stage} value={stage}>{stage}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Auto-rotate Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAutoRotate(!autoRotate)}
            className="text-white hover:bg-white/20"
          >
            {autoRotate ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
            {autoRotate ? 'Pausar' : 'Auto'}
          </Button>

          {/* View Controls */}
          <div className="flex gap-2">
            {views.map((view, index) => (
              <Button
                key={index}
                variant={currentView === index ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setCurrentView(index)}
                className={currentView === index ? "bg-white text-black" : "text-white hover:bg-white/20"}
              >
                {view.name}
              </Button>
            ))}
          </div>
          
          <div className="text-right">
            <div className="text-3xl font-mono font-bold">
              {formatTime(currentTime)}
            </div>
            <div className="text-sm opacity-90">
              {views[currentView].name}
            </div>
          </div>
          
          <Button 
            variant="secondary" 
            size="lg"
            onClick={onExitTVMode}
            className="h-12 px-6"
          >
            <X className="w-6 h-6 mr-2" />
            Sair
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 h-[calc(100vh-140px)] overflow-y-auto">
        <CurrentView 
          products={products}
          stages={stages}
          getProductsByStage={getProductsByStage}
          isOverdue={isOverdue}
          formatDate={formatDate}
          getStatusColor={getStatusColor}
          selectedStage={selectedStage}
        />
      </div>

      {/* View Indicator */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
        <div className="flex gap-2">
          {views.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentView ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Dashboard View with Charts and Overview
function DashboardView({ products, stages, getProductsByStage, isOverdue }: any) {
  const overdueCount = products.filter((p: any) => p.current_stage && isOverdue(p)).length;
  const inProgressCount = products.filter((p: any) => p.current_stage?.status === 'em_andamento').length;
  const completedCount = products.filter((p: any) => p.current_stage?.status === 'concluida').length;
  const pendingCount = products.filter((p: any) => p.current_stage?.status === 'pendente').length;

  // Prepare chart data
  const stageData = stages.map(stageName => {
    const stageProducts = getProductsByStage(stageName);
    const overdue = stageProducts.filter(isOverdue).length;
    const inProgress = stageProducts.filter(p => p.current_stage?.status === 'em_andamento').length;
    const completed = stageProducts.filter(p => p.current_stage?.status === 'concluida').length;
    const pending = stageProducts.filter(p => p.current_stage?.status === 'pendente').length;

    return {
      name: stageName.split(' ')[0], // Shorter name for chart
      total: stageProducts.length,
      overdue,
      inProgress,
      completed,
      pending
    };
  });

  const statusData = [
    { name: 'Concluído', value: completedCount, color: '#22c55e' },
    { name: 'Em Andamento', value: inProgressCount, color: '#3b82f6' },
    { name: 'Pendente', value: pendingCount, color: '#f59e0b' },
    { name: 'Atrasado', value: overdueCount, color: '#ef4444' }
  ];

  const completionRate = products.length > 0 ? (completedCount / products.length) * 100 : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* KPI Cards */}
      <div className="grid grid-cols-5 gap-6">
        <Card className="p-6 text-center bg-gradient-subtle">
          <div className="text-5xl font-bold text-primary mb-2">{products.length}</div>
          <div className="text-lg text-muted-foreground">Total de Produtos</div>
        </Card>
        <Card className="p-6 text-center bg-blue-50 border-blue-200">
          <div className="text-5xl font-bold text-blue-600 mb-2">{inProgressCount}</div>
          <div className="text-lg text-muted-foreground">Em Andamento</div>
        </Card>
        <Card className="p-6 text-center bg-red-50 border-red-200">
          <div className="text-5xl font-bold text-red-600 mb-2">{overdueCount}</div>
          <div className="text-lg text-muted-foreground">Atrasados</div>
        </Card>
        <Card className="p-6 text-center bg-green-50 border-green-200">
          <div className="text-5xl font-bold text-green-600 mb-2">{completedCount}</div>
          <div className="text-lg text-muted-foreground">Concluídos</div>
        </Card>
        <Card className="p-6 text-center bg-primary/10 border-primary/20">
          <div className="text-5xl font-bold text-primary mb-2">{completionRate.toFixed(0)}%</div>
          <div className="text-lg text-muted-foreground">Taxa de Conclusão</div>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-6">
        {/* Stage Distribution Chart */}
        <Card className="p-6">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Distribuição por Estágio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="pending" stackId="a" fill="#f59e0b" name="Pendente" />
                <Bar dataKey="inProgress" stackId="a" fill="#3b82f6" name="Em Andamento" />
                <Bar dataKey="completed" stackId="a" fill="#22c55e" name="Concluído" />
                <Bar dataKey="overdue" stackId="a" fill="#ef4444" name="Atrasado" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Pie Chart */}
        <Card className="p-6">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Status Geral
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }: { name?: string; percent?: number }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Stage Progress Overview */}
      <div className="grid grid-cols-3 gap-6">
        {stages.map(stageName => {
          const stageProducts = getProductsByStage(stageName);
          const overdueInStage = stageProducts.filter(isOverdue).length;
          const progress = stageProducts.length > 0 ? 
            (stageProducts.filter(p => p.current_stage?.status === 'concluida').length / stageProducts.length) * 100 : 0;

          return (
            <Card key={stageName} className="p-6 hover-scale">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{stageName}</h3>
                  <Badge variant="outline" className="text-lg px-3 py-1">
                    {stageProducts.length}
                  </Badge>
                </div>
                
                <Progress value={progress} className="h-3" />
                <div className="text-sm text-muted-foreground">
                  {progress.toFixed(0)}% concluído
                </div>

                {overdueInStage > 0 && (
                  <div className="flex items-center gap-2 text-red-600 animate-pulse">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="font-medium text-sm">
                      {overdueInStage} atrasado{overdueInStage > 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// Stage View with filtering
function StageView({ products, stages, getProductsByStage, isOverdue, formatDate, selectedStage }: any) {
  const stagesToShow = selectedStage === "all" ? stages : [selectedStage];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">
          {selectedStage === "all" ? "Todos os Estágios" : selectedStage}
        </h2>
        <p className="text-xl text-muted-foreground">
          Visualização detalhada da produção
        </p>
      </div>

      <div className="grid gap-6">
        {stagesToShow.map(stageName => {
          const stageProducts = getProductsByStage(stageName);
          const overdueInStage = stageProducts.filter(isOverdue).length;
          const inProgressInStage = stageProducts.filter(p => p.current_stage?.status === 'em_andamento').length;
          const completedInStage = stageProducts.filter(p => p.current_stage?.status === 'concluida').length;

          return (
            <Card key={stageName} className="p-6">
              <div className="space-y-6">
                {/* Stage Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold">{stageName}</h3>
                    <div className="flex gap-4 mt-2">
                      <Badge variant="outline" className="text-sm">
                        Total: {stageProducts.length}
                      </Badge>
                      <Badge className="bg-blue-500 text-white text-sm">
                        Em andamento: {inProgressInStage}
                      </Badge>
                      <Badge className="bg-green-500 text-white text-sm">
                        Concluído: {completedInStage}
                      </Badge>
                      {overdueInStage > 0 && (
                        <Badge className="bg-red-500 text-white text-sm animate-pulse">
                          Atrasado: {overdueInStage}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary">
                      {stageProducts.length > 0 ? ((completedInStage / stageProducts.length) * 100).toFixed(0) : 0}%
                    </div>
                    <div className="text-sm text-muted-foreground">Concluído</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <Progress 
                  value={stageProducts.length > 0 ? (completedInStage / stageProducts.length) * 100 : 0} 
                  className="h-4"
                />

                {/* Products Grid */}
                <div className="grid grid-cols-4 gap-4">
                  {stageProducts.slice(0, 8).map((product: any) => (
                    <Card key={product.id} className={`p-4 transition-all duration-200 ${
                      isOverdue(product) ? 'border-red-300 bg-red-50 animate-pulse' : 
                      product.current_stage?.status === 'em_andamento' ? 'border-blue-300 bg-blue-50' :
                      product.current_stage?.status === 'concluida' ? 'border-green-300 bg-green-50' :
                      'border-gray-200'
                    }`}>
                      <div className="space-y-3">
                        {product.image_url && (
                          <div className="w-full h-24 rounded-lg overflow-hidden bg-white">
                            <img 
                              src={product.image_url} 
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        
                        <div>
                          <h4 className="font-semibold text-sm truncate">{product.name}</h4>
                          <p className="text-xs text-muted-foreground">{product.code}</p>
                          
                          <div className="mt-2 space-y-1">
                            {product.collection_name && (
                              <Badge variant="outline" className="text-xs">
                                {product.collection_name}
                              </Badge>
                            )}
                            
                            {product.current_stage?.expected_date && (
                              <div className="text-xs">
                                <strong>Prazo:</strong> {formatDate(product.current_stage.expected_date)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {stageProducts.length > 8 && (
                  <div className="text-center">
                    <Badge variant="outline" className="text-sm">
                      +{stageProducts.length - 8} produtos adicionais
                    </Badge>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// Alerts View - Critical alerts and deadlines
function AlertsView({ products, isOverdue, formatDate }: any) {
  const overdueProducts = products.filter(isOverdue);
  const urgentProducts = products.filter((p: any) => {
    if (!p.current_stage?.expected_date) return false;
    const expectedDate = new Date(p.current_stage.expected_date);
    const today = new Date();
    const daysUntilDeadline = Math.ceil((expectedDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilDeadline <= 3 && daysUntilDeadline > 0;
  });

  const getDaysOverdue = (product: any) => {
    if (!product.current_stage?.expected_date) return 0;
    const expectedDate = new Date(product.current_stage.expected_date);
    const today = new Date();
    return Math.ceil((today.getTime() - expectedDate.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getDaysUntilDeadline = (product: any) => {
    if (!product.current_stage?.expected_date) return 0;
    const expectedDate = new Date(product.current_stage.expected_date);
    const today = new Date();
    return Math.ceil((expectedDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-red-600 mb-2">
          <AlertTriangle className="w-10 h-10 inline mr-3 animate-pulse" />
          Central de Alertas
        </h2>
        <p className="text-xl text-muted-foreground">
          Acompanhamento de prazos críticos
        </p>
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* Overdue Products - Critical */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-red-600 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
              Produtos Atrasados
            </h3>
            <Badge className="bg-red-500 text-white text-lg px-4 py-2">
              {overdueProducts.length}
            </Badge>
          </div>

          {overdueProducts.length === 0 ? (
            <Card className="p-8 text-center bg-green-50 border-green-200">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <h4 className="text-lg font-semibold text-green-600">Perfeito!</h4>
              <p className="text-muted-foreground">Nenhum produto atrasado</p>
            </Card>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {overdueProducts.map((product: any) => (
                <Card key={product.id} className="p-4 border-red-300 bg-red-50 animate-pulse">
                  <div className="flex items-center gap-4">
                    {product.image_url && (
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-white flex-shrink-0">
                        <img 
                          src={product.image_url} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="font-bold text-lg">{product.name}</h4>
                      <p className="text-sm text-muted-foreground">{product.code}</p>
                      
                      <div className="flex gap-2 mt-2">
                        <Badge className="bg-red-600 text-white">
                          {getDaysOverdue(product)} dias de atraso
                        </Badge>
                        <Badge variant="outline">
                          {product.current_stage.stage_name}
                        </Badge>
                      </div>
                      
                      <div className="text-sm mt-1">
                        <strong>Prazo era:</strong> {formatDate(product.current_stage.expected_date)}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Urgent Products - Warning */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-orange-600 flex items-center gap-2">
              <Clock className="w-6 h-6" />
              Prazos Urgentes
            </h3>
            <Badge className="bg-orange-500 text-white text-lg px-4 py-2">
              {urgentProducts.length}
            </Badge>
          </div>

          {urgentProducts.length === 0 ? (
            <Card className="p-8 text-center bg-blue-50 border-blue-200">
              <Clock className="w-12 h-12 text-blue-500 mx-auto mb-3" />
              <h4 className="text-lg font-semibold text-blue-600">Tranquilo!</h4>
              <p className="text-muted-foreground">Nenhum prazo urgente</p>
            </Card>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {urgentProducts.map((product: any) => (
                <Card key={product.id} className="p-4 border-orange-300 bg-orange-50">
                  <div className="flex items-center gap-4">
                    {product.image_url && (
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-white flex-shrink-0">
                        <img 
                          src={product.image_url} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="font-bold text-lg">{product.name}</h4>
                      <p className="text-sm text-muted-foreground">{product.code}</p>
                      
                      <div className="flex gap-2 mt-2">
                        <Badge className="bg-orange-600 text-white">
                          {getDaysUntilDeadline(product)} dias restantes
                        </Badge>
                        <Badge variant="outline">
                          {product.current_stage.stage_name}
                        </Badge>
                      </div>
                      
                      <div className="text-sm mt-1">
                        <strong>Prazo:</strong> {formatDate(product.current_stage.expected_date)}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Metrics View - Performance analytics
function MetricsView({ products, stages, getProductsByStage, isOverdue }: any) {
  const totalProducts = products.length;
  const completedProducts = products.filter((p: any) => p.current_stage?.status === 'concluida').length;
  const overdueProducts = products.filter(isOverdue).length;
  
  const completionRate = totalProducts > 0 ? (completedProducts / totalProducts) * 100 : 0;
  const overdueRate = totalProducts > 0 ? (overdueProducts / totalProducts) * 100 : 0;
  const onTimeRate = 100 - overdueRate;

  // Stage efficiency
  const stageEfficiency = stages.map(stageName => {
    const stageProducts = getProductsByStage(stageName);
    const completed = stageProducts.filter(p => p.current_stage?.status === 'concluida').length;
    const overdue = stageProducts.filter(isOverdue).length;
    const efficiency = stageProducts.length > 0 ? ((stageProducts.length - overdue) / stageProducts.length) * 100 : 100;
    
    return {
      name: stageName,
      total: stageProducts.length,
      completed,
      overdue,
      efficiency: efficiency.toFixed(1)
    };
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">
          <BarChart3 className="w-10 h-10 inline mr-3" />
          Métricas de Performance
        </h2>
        <p className="text-xl text-muted-foreground">
          Indicadores de produtividade e eficiência
        </p>
      </div>

      {/* Main KPIs */}
      <div className="grid grid-cols-4 gap-6">
        <Card className="p-6 text-center bg-primary/10 border-primary/20">
          <div className="text-4xl font-bold text-primary mb-2">{completionRate.toFixed(1)}%</div>
          <div className="text-lg text-muted-foreground">Taxa de Conclusão</div>
          <Progress value={completionRate} className="mt-3 h-2" />
        </Card>
        
        <Card className="p-6 text-center bg-green-50 border-green-200">
          <div className="text-4xl font-bold text-green-600 mb-2">{onTimeRate.toFixed(1)}%</div>
          <div className="text-lg text-muted-foreground">Entrega no Prazo</div>
          <Progress value={onTimeRate} className="mt-3 h-2" />
        </Card>
        
        <Card className="p-6 text-center bg-red-50 border-red-200">
          <div className="text-4xl font-bold text-red-600 mb-2">{overdueRate.toFixed(1)}%</div>
          <div className="text-lg text-muted-foreground">Taxa de Atraso</div>
          <Progress value={overdueRate} className="mt-3 h-2" />
        </Card>
        
        <Card className="p-6 text-center bg-blue-50 border-blue-200">
          <div className="text-4xl font-bold text-blue-600 mb-2">{totalProducts}</div>
          <div className="text-lg text-muted-foreground">Total Gerenciado</div>
          <div className="text-sm text-muted-foreground mt-2">produtos ativos</div>
        </Card>
      </div>

      {/* Stage Efficiency Table */}
      <Card className="p-6">
        <CardHeader className="pb-4">
          <CardTitle>Eficiência por Estágio</CardTitle>
          <CardDescription>
            Performance de cada estágio da linha de produção
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stageEfficiency.map((stage, index) => (
              <div key={stage.name} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-semibold">{stage.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {stage.total} produtos • {stage.completed} concluídos • {stage.overdue} atrasados
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">{stage.efficiency}%</div>
                  <div className="text-sm text-muted-foreground">eficiência</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}