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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      languages: {
        Row: {
          code: string
          created_at: string
          direction: string
          id: string
          name: string
          native_name: string
        }
        Insert: {
          code: string
          created_at?: string
          direction?: string
          id?: string
          name: string
          native_name: string
        }
        Update: {
          code?: string
          created_at?: string
          direction?: string
          id?: string
          name?: string
          native_name?: string
        }
        Relationships: []
      }
      letters: {
        Row: {
          created_at: string
          display_order: number | null
          english_letter: string
          example_word: string | null
          hebrew_letter: string
          id: string
          phonetic_description: string | null
          pronunciation: string | null
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          english_letter: string
          example_word?: string | null
          hebrew_letter: string
          id?: string
          phonetic_description?: string | null
          pronunciation?: string | null
        }
        Update: {
          created_at?: string
          display_order?: number | null
          english_letter?: string
          example_word?: string | null
          hebrew_letter?: string
          id?: string
          phonetic_description?: string | null
          pronunciation?: string | null
        }
        Relationships: []
      }
      numbers: {
        Row: {
          created_at: string
          description: string | null
          id: string
          number_value: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          number_value: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          number_value?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          audience_type: Database["public"]["Enums"]["audience_type"] | null
          created_at: string
          display_name: string | null
          english_level: string | null
          id: string
          interest_topics: string[] | null
          interests: string[] | null
          onboarding_completed: boolean | null
          segment_type: string | null
          skill_level: string | null
          source_language: string | null
          target_language: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          audience_type?: Database["public"]["Enums"]["audience_type"] | null
          created_at?: string
          display_name?: string | null
          english_level?: string | null
          id?: string
          interest_topics?: string[] | null
          interests?: string[] | null
          onboarding_completed?: boolean | null
          segment_type?: string | null
          skill_level?: string | null
          source_language?: string | null
          target_language?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          audience_type?: Database["public"]["Enums"]["audience_type"] | null
          created_at?: string
          display_name?: string | null
          english_level?: string | null
          id?: string
          interest_topics?: string[] | null
          interests?: string[] | null
          onboarding_completed?: boolean | null
          segment_type?: string | null
          skill_level?: string | null
          source_language?: string | null
          target_language?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at: string | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          paddle_customer_id: string | null
          paddle_subscription_id: string | null
          plan: string | null
          status: string
          trial_end: string | null
          trial_start: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          paddle_customer_id?: string | null
          paddle_subscription_id?: string | null
          plan?: string | null
          status?: string
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          paddle_customer_id?: string | null
          paddle_subscription_id?: string | null
          plan?: string | null
          status?: string
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_topic_preferences: {
        Row: {
          created_at: string | null
          id: string
          topic_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          topic_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          topic_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_words: {
        Row: {
          created_at: string
          flexi_correct_count: number | null
          flexi_practiced_at: string | null
          id: string
          is_flexi_learned: boolean | null
          last_practiced_at: string | null
          last_seen: string | null
          status: string | null
          updated_at: string
          user_id: string
          view_count: number
          word_id: string
        }
        Insert: {
          created_at?: string
          flexi_correct_count?: number | null
          flexi_practiced_at?: string | null
          id?: string
          is_flexi_learned?: boolean | null
          last_practiced_at?: string | null
          last_seen?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
          view_count?: number
          word_id: string
        }
        Update: {
          created_at?: string
          flexi_correct_count?: number | null
          flexi_practiced_at?: string | null
          id?: string
          is_flexi_learned?: boolean | null
          last_practiced_at?: string | null
          last_seen?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
          view_count?: number
          word_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_words_to_vocabulary"
            columns: ["word_id"]
            isOneToOne: false
            referencedRelation: "v_user_inflections"
            referencedColumns: ["word_id"]
          },
          {
            foreignKeyName: "fk_user_words_to_vocabulary"
            columns: ["word_id"]
            isOneToOne: false
            referencedRelation: "vocabulary_words"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_words_word_id_fkey"
            columns: ["word_id"]
            isOneToOne: false
            referencedRelation: "v_user_inflections"
            referencedColumns: ["word_id"]
          },
          {
            foreignKeyName: "user_words_word_id_fkey"
            columns: ["word_id"]
            isOneToOne: false
            referencedRelation: "vocabulary_words"
            referencedColumns: ["id"]
          },
        ]
      }
      vocabulary_words: {
        Row: {
          audience_levels: string[] | null
          category: string
          context_type: string | null
          created_at: string
          english_word: string
          example_sentence: string | null
          hebrew_translation: string
          id: string
          learning_level: string | null
          level: string | null
          priority: number | null
          pronunciation: string | null
          updated_at: string
          word_pair: string | null
        }
        Insert: {
          audience_levels?: string[] | null
          category: string
          context_type?: string | null
          created_at?: string
          english_word: string
          example_sentence?: string | null
          hebrew_translation: string
          id?: string
          learning_level?: string | null
          level?: string | null
          priority?: number | null
          pronunciation?: string | null
          updated_at?: string
          word_pair?: string | null
        }
        Update: {
          audience_levels?: string[] | null
          category?: string
          context_type?: string | null
          created_at?: string
          english_word?: string
          example_sentence?: string | null
          hebrew_translation?: string
          id?: string
          learning_level?: string | null
          level?: string | null
          priority?: number | null
          pronunciation?: string | null
          updated_at?: string
          word_pair?: string | null
        }
        Relationships: []
      }
      word_inflections: {
        Row: {
          created_at: string | null
          grammar_note: string | null
          inflected_translation: string
          inflected_word: string
          root_word: string
        }
        Insert: {
          created_at?: string | null
          grammar_note?: string | null
          inflected_translation: string
          inflected_word: string
          root_word: string
        }
        Update: {
          created_at?: string | null
          grammar_note?: string | null
          inflected_translation?: string
          inflected_word?: string
          root_word?: string
        }
        Relationships: [
          {
            foreignKeyName: "word_inflections_root_word_fkey"
            columns: ["root_word"]
            isOneToOne: false
            referencedRelation: "v_user_inflections"
            referencedColumns: ["root_word"]
          },
          {
            foreignKeyName: "word_inflections_root_word_fkey"
            columns: ["root_word"]
            isOneToOne: false
            referencedRelation: "vocabulary_words"
            referencedColumns: ["english_word"]
          },
        ]
      }
      word_translations: {
        Row: {
          category: string
          created_at: string
          example_sentence_1: string | null
          example_sentence_2: string | null
          id: string
          word_id_1: string
          word_id_2: string
        }
        Insert: {
          category?: string
          created_at?: string
          example_sentence_1?: string | null
          example_sentence_2?: string | null
          id?: string
          word_id_1: string
          word_id_2: string
        }
        Update: {
          category?: string
          created_at?: string
          example_sentence_1?: string | null
          example_sentence_2?: string | null
          id?: string
          word_id_1?: string
          word_id_2?: string
        }
        Relationships: [
          {
            foreignKeyName: "word_translations_word_id_1_fkey"
            columns: ["word_id_1"]
            isOneToOne: false
            referencedRelation: "words"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "word_translations_word_id_2_fkey"
            columns: ["word_id_2"]
            isOneToOne: false
            referencedRelation: "words"
            referencedColumns: ["id"]
          },
        ]
      }
      words: {
        Row: {
          created_at: string
          id: string
          language_id: string
          pronunciation: string | null
          word_text: string
        }
        Insert: {
          created_at?: string
          id?: string
          language_id: string
          pronunciation?: string | null
          word_text: string
        }
        Update: {
          created_at?: string
          id?: string
          language_id?: string
          pronunciation?: string | null
          word_text?: string
        }
        Relationships: [
          {
            foreignKeyName: "words_language_id_fkey"
            columns: ["language_id"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      v_user_inflections: {
        Row: {
          example_sentence: string | null
          flexi_practiced_at: string | null
          grammar_note: string | null
          inflected_translation: string | null
          inflected_word: string | null
          root_translation: string | null
          root_word: string | null
          status: string | null
          user_id: string | null
          user_word_id: string | null
          word_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      auto_refill_words: {
        Args: {
          p_category: string
          p_level: string
          p_limit?: number
          p_user_id: string
        }
        Returns: undefined
      }
      maintain_minimum_words: {
        Args: {
          p_category: string
          p_level: string
          p_min_count?: number
          p_user_id: string
        }
        Returns: undefined
      }
      refill_user_words: {
        Args: {
          target_user_id: string
          user_category: string
          user_level: string
        }
        Returns: undefined
      }
    }
    Enums: {
      audience_type: "kids" | "students" | "business"
      word_status: "new" | "queued" | "learned"
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
    Enums: {
      audience_type: ["kids", "students", "business"],
      word_status: ["new", "queued", "learned"],
    },
  },
} as const
