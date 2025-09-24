export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      clients: {
        Row: {
          active: boolean
          address: string | null
          city: string | null
          cnpj: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          state: string | null
          updated_at: string
          zip_code: string | null
        }
        Insert: {
          active?: boolean
          address?: string | null
          city?: string | null
          cnpj?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          state?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Update: {
          active?: boolean
          address?: string | null
          city?: string | null
          cnpj?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          state?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Relationships: []
      }
      collections: {
        Row: {
          active_status: string
          budget: number | null
          client_id: string
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          name: string
          season: string
          start_date: string | null
          status: string
          stylist_id: string | null
          total_deadline: string | null
          updated_at: string
        }
        Insert: {
          active_status?: string
          budget?: number | null
          client_id: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          season: string
          start_date?: string | null
          status?: string
          stylist_id?: string | null
          total_deadline?: string | null
          updated_at?: string
        }
        Update: {
          active_status?: string
          budget?: number | null
          client_id?: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          season?: string
          start_date?: string | null
          status?: string
          stylist_id?: string | null
          total_deadline?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "collections_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collections_stylist_id_fkey"
            columns: ["stylist_id"]
            isOneToOne: false
            referencedRelation: "stylists"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          author_name: string
          collection_id: string | null
          content: string
          created_at: string
          id: string
          product_id: string | null
          task_id: string | null
          updated_at: string
        }
        Insert: {
          author_name: string
          collection_id?: string | null
          content: string
          created_at?: string
          id?: string
          product_id?: string | null
          task_id?: string | null
          updated_at?: string
        }
        Update: {
          author_name?: string
          collection_id?: string | null
          content?: string
          created_at?: string
          id?: string
          product_id?: string | null
          task_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      materials: {
        Row: {
          active: boolean
          category: string
          color: string | null
          composition: string | null
          created_at: string
          id: string
          name: string
          stock_quantity: number | null
          supplier: string | null
          unit: string
          unit_price: number | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          category: string
          color?: string | null
          composition?: string | null
          created_at?: string
          id?: string
          name: string
          stock_quantity?: number | null
          supplier?: string | null
          unit?: string
          unit_price?: number | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          category?: string
          color?: string | null
          composition?: string | null
          created_at?: string
          id?: string
          name?: string
          stock_quantity?: number | null
          supplier?: string | null
          unit?: string
          unit_price?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      product_files: {
        Row: {
          created_at: string | null
          file_name: string
          file_size: number | null
          file_type: string
          file_url: string
          id: string
          product_id: string | null
          updated_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string | null
          file_name: string
          file_size?: number | null
          file_type: string
          file_url: string
          id?: string
          product_id?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string | null
          file_name?: string
          file_size?: number | null
          file_type?: string
          file_url?: string
          id?: string
          product_id?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_files_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_materials: {
        Row: {
          created_at: string
          id: string
          material_id: string
          notes: string | null
          product_id: string
          quantity: number
        }
        Insert: {
          created_at?: string
          id?: string
          material_id: string
          notes?: string | null
          product_id: string
          quantity: number
        }
        Update: {
          created_at?: string
          id?: string
          material_id?: string
          notes?: string | null
          product_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_materials_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_materials_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      production_schedule_config: {
        Row: {
          created_at: string | null
          duration_days: number
          id: string
          priority_multiplier: number | null
          stage_name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          duration_days: number
          id?: string
          priority_multiplier?: number | null
          stage_name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          duration_days?: number
          id?: string
          priority_multiplier?: number | null
          stage_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      production_stages: {
        Row: {
          actual_date: string | null
          created_at: string | null
          duration_days: number | null
          expected_date: string | null
          id: string
          maqueteira_responsavel: string | null
          notes: string | null
          product_id: string | null
          stage_name: string
          stage_order: number
          status: string
          stylist_id: string | null
          updated_at: string | null
        }
        Insert: {
          actual_date?: string | null
          created_at?: string | null
          duration_days?: number | null
          expected_date?: string | null
          id?: string
          maqueteira_responsavel?: string | null
          notes?: string | null
          product_id?: string | null
          stage_name: string
          stage_order: number
          status?: string
          stylist_id?: string | null
          updated_at?: string | null
        }
        Update: {
          actual_date?: string | null
          created_at?: string | null
          duration_days?: number | null
          expected_date?: string | null
          id?: string
          maqueteira_responsavel?: string | null
          notes?: string | null
          product_id?: string | null
          stage_name?: string
          stage_order?: number
          status?: string
          stylist_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "production_stages_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_stages_stylist_id_fkey"
            columns: ["stylist_id"]
            isOneToOne: false
            referencedRelation: "stylists"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          client_id: string
          code: string
          collection_id: string
          created_at: string
          description: string | null
          difficulty_level: string | null
          id: string
          image_url: string | null
          name: string | null
          priority: string | null
          production_cost: number | null
          size_range: string | null
          status: string
          stylist_id: string | null
          target_price: number | null
          updated_at: string
        }
        Insert: {
          client_id: string
          code: string
          collection_id: string
          created_at?: string
          description?: string | null
          difficulty_level?: string | null
          id?: string
          image_url?: string | null
          name?: string | null
          priority?: string | null
          production_cost?: number | null
          size_range?: string | null
          status?: string
          stylist_id?: string | null
          target_price?: number | null
          updated_at?: string
        }
        Update: {
          client_id?: string
          code?: string
          collection_id?: string
          created_at?: string
          description?: string | null
          difficulty_level?: string | null
          id?: string
          image_url?: string | null
          name?: string | null
          priority?: string | null
          production_cost?: number | null
          size_range?: string | null
          status?: string
          stylist_id?: string | null
          target_price?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_stylist_id_fkey"
            columns: ["stylist_id"]
            isOneToOne: false
            referencedRelation: "stylists"
            referencedColumns: ["id"]
          },
        ]
      }
      stage_change_history: {
        Row: {
          change_reason: string | null
          changed_by: string
          created_at: string
          id: string
          new_stage_name: string | null
          new_status: string
          notes: string | null
          previous_stage_name: string | null
          previous_status: string | null
          product_id: string
          stage_id: string
        }
        Insert: {
          change_reason?: string | null
          changed_by: string
          created_at?: string
          id?: string
          new_stage_name?: string | null
          new_status: string
          notes?: string | null
          previous_stage_name?: string | null
          previous_status?: string | null
          product_id: string
          stage_id: string
        }
        Update: {
          change_reason?: string | null
          changed_by?: string
          created_at?: string
          id?: string
          new_stage_name?: string | null
          new_status?: string
          notes?: string | null
          previous_stage_name?: string | null
          previous_status?: string | null
          product_id?: string
          stage_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stage_change_history_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stage_change_history_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "production_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      stage_comments: {
        Row: {
          author_name: string
          content: string
          created_at: string
          id: string
          is_internal: boolean
          priority: string | null
          product_id: string
          stage_id: string
          updated_at: string
        }
        Insert: {
          author_name: string
          content: string
          created_at?: string
          id?: string
          is_internal?: boolean
          priority?: string | null
          product_id: string
          stage_id: string
          updated_at?: string
        }
        Update: {
          author_name?: string
          content?: string
          created_at?: string
          id?: string
          is_internal?: boolean
          priority?: string | null
          product_id?: string
          stage_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stage_comments_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stage_comments_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "production_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      stylists: {
        Row: {
          active: boolean
          bio: string | null
          created_at: string
          email: string | null
          experience_years: number | null
          hourly_rate: number | null
          id: string
          name: string
          phone: string | null
          portfolio_url: string | null
          skills: string[] | null
          specialty: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          bio?: string | null
          created_at?: string
          email?: string | null
          experience_years?: number | null
          hourly_rate?: number | null
          id?: string
          name: string
          phone?: string | null
          portfolio_url?: string | null
          skills?: string[] | null
          specialty?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          bio?: string | null
          created_at?: string
          email?: string | null
          experience_years?: number | null
          hourly_rate?: number | null
          id?: string
          name?: string
          phone?: string | null
          portfolio_url?: string | null
          skills?: string[] | null
          specialty?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          actual_hours: number | null
          collection_id: string | null
          created_at: string
          description: string | null
          due_date: string | null
          estimated_hours: number | null
          id: string
          priority: string | null
          product_id: string | null
          status: string
          stylist_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          actual_hours?: number | null
          collection_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          priority?: string | null
          product_id?: string | null
          status?: string
          stylist_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          actual_hours?: number | null
          collection_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          priority?: string | null
          product_id?: string | null
          status?: string
          stylist_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_stylist_id_fkey"
            columns: ["stylist_id"]
            isOneToOne: false
            referencedRelation: "stylists"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_production_schedule: {
        Args: { product_id_param: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
