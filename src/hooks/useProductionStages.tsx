import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProductionStage {
  id: string;
  product_id: string;
  stage_name: string;
  stage_order: number;
  expected_date?: string;
  actual_date?: string;
  status: string;
  notes?: string;
}

interface ProductFile {
  id: string;
  product_id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  uploaded_by?: string;
}

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
  current_stage: ProductionStage;
  files: ProductFile[];
}

export function useProductionStages() {
  const [products, setProducts] = useState<ProductWithStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const { toast } = useToast();

  const STAGE_ORDER = [
    'Briefing Recebido',
    'Modelagem Técnica', 
    'Piloto Finalizado',
    'Envio para Aprovação',
    'Aprovado',
    'Mostruário e Entregue'
  ];

  const fetchProductsWithStages = async () => {
    try {
      // Fetch products with collections and clients
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select(`
          id,
          name,
          code,
          image_url,
          priority,
          status,
          created_at,
          collections!inner(name),
          clients!inner(name)
        `);

      if (productsError) throw productsError;

      // Fetch production stages
      const { data: stagesData, error: stagesError } = await supabase
        .from('production_stages')
        .select('*')
        .order('stage_order');

      if (stagesError) throw stagesError;

      // Fetch product files
      const { data: filesData, error: filesError } = await supabase
        .from('product_files')
        .select('*');

      if (filesError) throw filesError;

      // Check for products without stages and create them
      const productsWithoutStages = productsData.filter(product => 
        !stagesData.some(stage => stage.product_id === product.id)
      );

      if (productsWithoutStages.length > 0) {
        console.log(`Creating stages for ${productsWithoutStages.length} products`);
        for (const product of productsWithoutStages) {
          const stagesToInsert = [
            { product_id: product.id, stage_name: 'Briefing Recebido', stage_order: 1, status: 'pendente', duration_days: 2 },
            { product_id: product.id, stage_name: 'Modelagem Técnica', stage_order: 2, status: 'pendente', duration_days: 5 },
            { product_id: product.id, stage_name: 'Piloto Finalizado', stage_order: 3, status: 'pendente', duration_days: 7 },
            { product_id: product.id, stage_name: 'Envio para Aprovação', stage_order: 4, status: 'pendente', duration_days: 3 },
            { product_id: product.id, stage_name: 'Aprovado', stage_order: 5, status: 'pendente', duration_days: 2 },
            { product_id: product.id, stage_name: 'Mostruário e Entregue', stage_order: 6, status: 'pendente', duration_days: 1 }
          ];

          const { error: insertError } = await supabase
            .from('production_stages')
            .insert(stagesToInsert);

          if (insertError) {
            console.error('Error creating stages for product:', product.id, insertError);
          } else {
            // Recalcular cronograma após criar as etapas
            await recalculateProductSchedule(product.id);
          }
        }

        // Refetch stages after creating missing ones
        const { data: updatedStagesData, error: updatedStagesError } = await supabase
          .from('production_stages')
          .select('*')
          .order('stage_order');

        if (!updatedStagesError) {
          stagesData.push(...(updatedStagesData || []));
        }
      }

      // Combine data
      const productsWithStages: ProductWithStage[] = productsData.map(product => {
        const productStages = stagesData.filter(stage => stage.product_id === product.id);
        const productFiles = filesData.filter(file => file.product_id === product.id);
        
        // Find current stage (first incomplete stage or last completed)
        let currentStage = productStages.find(stage => 
          stage.status === 'pendente' || stage.status === 'em_andamento'
        );
        
        if (!currentStage) {
          // All stages completed, use last stage
          currentStage = productStages[productStages.length - 1];
        }

        // Create default stage if no stages exist for this product
        const defaultStage = {
          id: 'default',
          product_id: product.id,
          stage_name: 'Briefing Recebido',
          stage_order: 1,
          expected_date: undefined,
          actual_date: undefined,
          status: 'pendente',
          notes: undefined
        };

        return {
          id: product.id,
          name: product.name,
          code: product.code,
          image_url: product.image_url,
          collection_name: product.collections?.name,
          client_name: product.clients?.name,
          priority: product.priority,
          status: product.status,
          created_at: product.created_at,
          current_stage: currentStage || defaultStage,
          files: productFiles || []
        };
      });

      setProducts(productsWithStages);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar produtos e etapas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateStageStatus = async (productId: string, stageId: string, status: string, actualDate?: string) => {
    try {
      const updateData: any = { status };
      if (actualDate) {
        updateData.actual_date = actualDate;
      }

      const { error } = await supabase
        .from('production_stages')
        .update(updateData)
        .eq('id', stageId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Etapa atualizada com sucesso",
      });

      await fetchProductsWithStages();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar etapa",
        variant: "destructive",
      });
    }
  };

  const advanceToNextStage = async (productId: string) => {
    try {
      const product = products.find(p => p.id === productId);
      if (!product) return;

      const currentStageOrder = product.current_stage.stage_order;
      
      // Mark current stage as completed
      await supabase
        .from('production_stages')
        .update({ 
          status: 'concluida',
          actual_date: new Date().toISOString().split('T')[0]
        })
        .eq('id', product.current_stage.id);

      // Find and activate next stage
      const { data: nextStage } = await supabase
        .from('production_stages')
        .select('*')
        .eq('product_id', productId)
        .eq('stage_order', currentStageOrder + 1)
        .single();

      if (nextStage) {
        await supabase
          .from('production_stages')
          .update({ status: 'em_andamento' })
          .eq('id', nextStage.id);
      }

      toast({
        title: "Sucesso",
        description: "Produto avançado para próxima etapa",
      });

      await fetchProductsWithStages();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erro",
        description: "Erro ao avançar etapa",
        variant: "destructive",
      });
    }
  };

  const uploadFile = async (productId: string, file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${productId}/${fileName}`;

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('product-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('product-files')
        .getPublicUrl(filePath);

      // Save file record to database
      const { error: dbError } = await supabase
        .from('product_files')
        .insert({
          product_id: productId,
          file_name: file.name,
          file_url: publicUrl,
          file_type: file.type,
          file_size: file.size,
        });

      if (dbError) throw dbError;

      toast({
        title: "Sucesso",
        description: "Arquivo enviado com sucesso",
      });

      await fetchProductsWithStages();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar arquivo",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteFile = async (fileId: string) => {
    try {
      // Get file info first
      const { data: fileData, error: fileError } = await supabase
        .from('product_files')
        .select('file_url')
        .eq('id', fileId)
        .single();

      if (fileError) throw fileError;

      // Extract file path from URL
      const url = new URL(fileData.file_url);
      const filePath = url.pathname.split('/').pop();

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('product-files')
        .remove([filePath]);

      if (storageError) console.error('Storage delete error:', storageError);

      // Delete from database
      const { error: dbError } = await supabase
        .from('product_files')
        .delete()
        .eq('id', fileId);

      if (dbError) throw dbError;

      toast({
        title: "Sucesso",
        description: "Arquivo excluído com sucesso",
      });

      await fetchProductsWithStages();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir arquivo",
        variant: "destructive",
      });
      throw error;
    }
  };

  const getProductsByStage = (stageName: string) => {
    return products.filter(product => 
      product.current_stage?.stage_name === stageName
    );
  };

  const isOverdue = (product: ProductWithStage): boolean => {
    if (!product.current_stage?.expected_date) return false;
    
    const expectedDate = new Date(product.current_stage.expected_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expectedDate.setHours(0, 0, 0, 0);
    
    return expectedDate < today && product.current_stage.status !== 'concluida';
  };

  const recalculateProductSchedule = async (productId: string) => {
    try {
      const { error } = await supabase.functions.invoke('recalculate-schedule', {
        body: { productId }
      });
      
      if (error) {
        console.error('Error recalculating schedule:', error);
      }
    } catch (error) {
      console.error('Error calling recalculate-schedule function:', error);
    }
  };

  const recalculateCollectionSchedule = async (collectionId: string) => {
    setScheduleLoading(true);
    try {
      const { error } = await supabase.functions.invoke('recalculate-schedule', {
        body: { collectionId }
      });
      
      if (error) {
        console.error('Error recalculating collection schedule:', error);
        return false;
      }
      
      await fetchProductsWithStages(); // Refresh data
      return true;
    } catch (error) {
      console.error('Error calling recalculate-schedule function:', error);
      return false;
    } finally {
      setScheduleLoading(false);
    }
  };

  const recalculateAllSchedules = async () => {
    setScheduleLoading(true);
    try {
      const { error } = await supabase.functions.invoke('recalculate-schedule', {
        body: { recalculateAll: true }
      });
      
      if (error) {
        console.error('Error recalculating all schedules:', error);
        return false;
      }
      
      await fetchProductsWithStages(); // Refresh data
      return true;
    } catch (error) {
      console.error('Error calling recalculate-schedule function:', error);
      return false;
    } finally {
      setScheduleLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsWithStages();
  }, []);

  return {
    products,
    loading,
    scheduleLoading,
    STAGE_ORDER,
    updateStageStatus,
    advanceToNextStage,
    uploadFile,
    deleteFile,
    getProductsByStage,
    isOverdue,
    fetchProductsWithStages,
    refetch: fetchProductsWithStages,
    recalculateProductSchedule,
    recalculateCollectionSchedule,
    recalculateAllSchedules,
  };
}