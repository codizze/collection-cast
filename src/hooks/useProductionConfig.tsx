import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ProductionStageConfig {
  id: string;
  stage_name: string;
  duration_days: number;
  priority_multiplier: number;
}

export const useProductionConfig = () => {
  const [configs, setConfigs] = useState<ProductionStageConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchConfigs = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('production_schedule_config')
        .select('*')
        .order('stage_name');

      if (error) throw error;

      setConfigs(data || []);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as configurações de produção",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateConfig = async (id: string, updates: Partial<ProductionStageConfig>) => {
    try {
      const { error } = await supabase
        .from('production_schedule_config')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      await fetchConfigs();
      
      toast({
        title: "Sucesso",
        description: "Configuração atualizada com sucesso",
      });
    } catch (error) {
      console.error('Erro ao atualizar configuração:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a configuração",
        variant: "destructive",
      });
    }
  };

  const recalculateAllSchedules = async () => {
    try {
      const { error } = await supabase.functions.invoke('recalculate-schedule', {
        body: { recalculateAll: true }
      });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Cronogramas recalculados com sucesso",
      });
    } catch (error) {
      console.error('Erro ao recalcular cronogramas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível recalcular os cronogramas",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  return {
    configs,
    isLoading,
    updateConfig,
    recalculateAllSchedules,
    refetch: fetchConfigs
  };
};