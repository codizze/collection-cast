import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ScheduleRequest {
  productId?: string;
  collectionId?: string;
  recalculateAll?: boolean;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { productId, collectionId, recalculateAll }: ScheduleRequest = await req.json()

    if (recalculateAll) {
      // Recalcular todos os produtos
      const { data: products, error: productsError } = await supabaseClient
        .from('products')
        .select('id')

      if (productsError) {
        throw productsError
      }

      for (const product of products) {
        await supabaseClient.rpc('calculate_production_schedule', {
          product_id_param: product.id
        })
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Recalculados ${products.length} produtos`,
          productsRecalculated: products.length
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (collectionId) {
      // Recalcular produtos de uma coleção específica
      const { data: products, error: productsError } = await supabaseClient
        .from('products')
        .select('id')
        .eq('collection_id', collectionId)

      if (productsError) {
        throw productsError
      }

      for (const product of products) {
        await supabaseClient.rpc('calculate_production_schedule', {
          product_id_param: product.id
        })
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Recalculados ${products.length} produtos da coleção`,
          productsRecalculated: products.length
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (productId) {
      // Recalcular produto específico
      const { error } = await supabaseClient.rpc('calculate_production_schedule', {
        product_id_param: productId
      })

      if (error) {
        throw error
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Cronograma recalculado com sucesso',
          productId: productId
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Parâmetros inválidos. Forneça productId, collectionId ou recalculateAll' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erro ao recalcular cronograma:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do servidor',
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})