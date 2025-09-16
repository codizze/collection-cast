import { useState, useEffect } from "react";
import { X, AlertTriangle, CheckCircle, Clock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

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

  const views = [
    { name: 'Visão Geral', component: OverviewView },
    { name: 'Produtos Atrasados', component: OverdueView },
    { name: 'Em Andamento', component: InProgressView }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    const viewTimer = setInterval(() => {
      setCurrentView(prev => (prev + 1) % views.length);
    }, 15000); // Change view every 15 seconds

    return () => {
      clearInterval(timer);
      clearInterval(viewTimer);
    };
  }, [views.length]);

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
      <div className="flex justify-between items-center p-6 bg-primary text-primary-foreground">
        <div className="flex items-center gap-6">
          <h1 className="text-4xl font-bold">Fashion Factory - Produção</h1>
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
            Sair do Modo TV
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 h-[calc(100vh-100px)] overflow-y-auto">
        <CurrentView 
          products={products}
          stages={stages}
          getProductsByStage={getProductsByStage}
          isOverdue={isOverdue}
          formatDate={formatDate}
          getStatusColor={getStatusColor}
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

function OverviewView({ products, stages, getProductsByStage, isOverdue, formatDate, getStatusColor }: any) {
  const overdueCount = products.filter((p: any) => p.current_stage && isOverdue(p)).length;
  const inProgressCount = products.filter((p: any) => p.current_stage?.status === 'em_andamento').length;
  const completedCount = products.filter((p: any) => p.current_stage?.status === 'concluida').length;

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-6">
        <Card className="p-6 text-center">
          <div className="text-4xl font-bold text-primary mb-2">{products.length}</div>
          <div className="text-lg text-muted-foreground">Total de Produtos</div>
        </Card>
        <Card className="p-6 text-center">
          <div className="text-4xl font-bold text-blue-600 mb-2">{inProgressCount}</div>
          <div className="text-lg text-muted-foreground">Em Andamento</div>
        </Card>
        <Card className="p-6 text-center">
          <div className="text-4xl font-bold text-red-600 mb-2">{overdueCount}</div>
          <div className="text-lg text-muted-foreground">Atrasados</div>
        </Card>
        <Card className="p-6 text-center">
          <div className="text-4xl font-bold text-green-600 mb-2">{completedCount}</div>
          <div className="text-lg text-muted-foreground">Concluídos</div>
        </Card>
      </div>

      {/* Stages Overview */}
      <div className="grid grid-cols-3 gap-6">
        {stages.map(stageName => {
          const stageProducts = getProductsByStage(stageName);
          const overdueInStage = stageProducts.filter(isOverdue).length;

          return (
            <Card key={stageName} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">{stageName}</h3>
                <Badge variant="outline" className="text-lg px-3 py-1">
                  {stageProducts.length}
                </Badge>
              </div>
              
              {overdueInStage > 0 && (
                <div className="flex items-center gap-2 text-red-600 mb-3">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-medium">{overdueInStage} atrasado{overdueInStage > 1 ? 's' : ''}</span>
                </div>
              )}

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {stageProducts.slice(0, 5).map(product => (
                  <div key={product.id} className={`p-3 rounded-lg border ${
                    isOverdue(product) ? 'bg-red-50 border-red-200' : 'bg-muted/50'
                  }`}>
                    <div className="font-medium text-sm">{product.name}</div>
                    <div className="text-xs text-muted-foreground">{product.code}</div>
                    {product.collection_name && (
                      <Badge variant="outline" className="text-xs mt-1">
                        {product.collection_name}
                      </Badge>
                    )}
                  </div>
                ))}
                {stageProducts.length > 5 && (
                  <div className="text-center text-muted-foreground text-sm py-2">
                    +{stageProducts.length - 5} mais
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

function OverdueView({ products, isOverdue, formatDate }: any) {
  const overdueProducts = products.filter(isOverdue);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-red-600 mb-2">
          <AlertTriangle className="w-10 h-10 inline mr-3" />
          Produtos Atrasados
        </h2>
        <p className="text-xl text-muted-foreground">
          {overdueProducts.length} produto{overdueProducts.length > 1 ? 's' : ''} com atraso
        </p>
      </div>

      {overdueProducts.length === 0 ? (
        <div className="text-center py-16">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-2xl font-semibold text-green-600">Parabéns!</h3>
          <p className="text-lg text-muted-foreground">Nenhum produto atrasado</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6">
          {overdueProducts.map((product: any) => (
            <Card key={product.id} className="p-6 border-red-200 bg-red-50">
              <div className="flex gap-4">
                {product.image_url && (
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-white">
                    <img 
                      src={product.image_url} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="text-lg font-semibold mb-1">{product.name}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{product.code}</p>
                  
                  <div className="space-y-2">
                    <Badge className="bg-red-500 text-white">
                      {product.current_stage.stage_name}
                    </Badge>
                    
                    {product.collection_name && (
                      <Badge variant="outline">
                        {product.collection_name}
                      </Badge>
                    )}
                    
                    <div className="text-sm">
                      <strong>Prazo:</strong> {formatDate(product.current_stage.expected_date)}
                    </div>
                    
                    {product.client_name && (
                      <div className="text-sm">
                        <strong>Cliente:</strong> {product.client_name}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function InProgressView({ products, formatDate }: any) {
  const inProgressProducts = products.filter((p: any) => p.current_stage?.status === 'em_andamento');

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-blue-600 mb-2">
          <Clock className="w-10 h-10 inline mr-3" />
          Produtos em Andamento
        </h2>
        <p className="text-xl text-muted-foreground">
          {inProgressProducts.length} produto{inProgressProducts.length > 1 ? 's' : ''} sendo produzido{inProgressProducts.length > 1 ? 's' : ''}
        </p>
      </div>

      {inProgressProducts.length === 0 ? (
        <div className="text-center py-16">
          <Clock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-2xl font-semibold">Nenhum produto em produção</h3>
          <p className="text-lg text-muted-foreground">Todos os produtos estão finalizados ou pendentes</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {inProgressProducts.map((product: any) => (
            <Card key={product.id} className="p-6 border-blue-200 bg-blue-50">
              <div className="space-y-4">
                {product.image_url && (
                  <div className="w-full h-32 rounded-lg overflow-hidden bg-white">
                    <img 
                      src={product.image_url} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div>
                  <h4 className="text-lg font-semibold mb-1">{product.name}</h4>
                  <p className="text-sm text-muted-foreground mb-3">{product.code}</p>
                  
                  <div className="space-y-2">
                    <Badge className="bg-blue-500 text-white">
                      {product.current_stage.stage_name}
                    </Badge>
                    
                    {product.collection_name && (
                      <Badge variant="outline">
                        {product.collection_name}
                      </Badge>
                    )}
                    
                    <div className="text-sm">
                      <strong>Prazo:</strong> {formatDate(product.current_stage.expected_date)}
                    </div>
                    
                    {product.client_name && (
                      <div className="text-sm">
                        <strong>Cliente:</strong> {product.client_name}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}