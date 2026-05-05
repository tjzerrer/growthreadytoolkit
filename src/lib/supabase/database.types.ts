export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          school_name: string | null;
          school_year: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          school_name?: string | null;
          school_year?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      classes: {
        Row: {
          id: string;
          teacher_id: string | null;
          class_name: string;
          period_label: string | null;
          term: string | null;
          school_year: string | null;
          active: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          teacher_id?: string | null;
          class_name: string;
          period_label?: string | null;
          term?: string | null;
          school_year?: string | null;
          active?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["classes"]["Insert"]>;
        Relationships: [];
      };
      students: {
        Row: {
          id: string;
          teacher_id: string | null;
          class_id: string | null;
          local_student_id: string | null;
          display_name: string;
          first_name: string | null;
          last_name: string | null;
          email: string | null;
          active: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          teacher_id?: string | null;
          class_id?: string | null;
          local_student_id?: string | null;
          display_name: string;
          first_name?: string | null;
          last_name?: string | null;
          email?: string | null;
          active?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["students"]["Insert"]>;
        Relationships: [];
      };
      assignments: {
        Row: {
          id: string;
          teacher_id: string | null;
          assignment_name: string;
          source: string | null;
          assignment_type: string | null;
          date_administered: string | null;
          total_points: number | null;
          raw_file_name: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          teacher_id?: string | null;
          assignment_name: string;
          source?: string | null;
          assignment_type?: string | null;
          date_administered?: string | null;
          total_points?: number | null;
          raw_file_name?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["assignments"]["Insert"]>;
        Relationships: [];
      };
      questions: {
        Row: {
          id: string;
          teacher_id: string | null;
          assignment_id: string | null;
          mom_question_label: string;
          mom_question_id: string | null;
          points_possible: number | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          teacher_id?: string | null;
          assignment_id?: string | null;
          mom_question_label: string;
          mom_question_id?: string | null;
          points_possible?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["questions"]["Insert"]>;
        Relationships: [];
      };
      question_tags: {
        Row: {
          id: string;
          teacher_id: string | null;
          question_id: string | null;
          raw_tag: string | null;
          teks_code: string | null;
          skill_description: string | null;
          standard_type: string | null;
          priority: string | null;
          complexity: string | null;
          reporting_category_id: number | null;
          reporting_category_name: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          teacher_id?: string | null;
          question_id?: string | null;
          raw_tag?: string | null;
          teks_code?: string | null;
          skill_description?: string | null;
          standard_type?: string | null;
          priority?: string | null;
          complexity?: string | null;
          reporting_category_id?: number | null;
          reporting_category_name?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["question_tags"]["Insert"]>;
        Relationships: [];
      };
      problem_mappings: {
        Row: {
          id: string;
          teacher_id: string | null;
          mom_question_id: string;
          raw_tag: string | null;
          teks_code: string | null;
          skill_description: string | null;
          standard_type: string | null;
          priority: string | null;
          complexity: string | null;
          reporting_category_id: number | null;
          reporting_category_name: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          teacher_id?: string | null;
          mom_question_id: string;
          raw_tag?: string | null;
          teks_code?: string | null;
          skill_description?: string | null;
          standard_type?: string | null;
          priority?: string | null;
          complexity?: string | null;
          reporting_category_id?: number | null;
          reporting_category_name?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["problem_mappings"]["Insert"]>;
        Relationships: [];
      };
      evidence: {
        Row: {
          id: string;
          teacher_id: string | null;
          student_id: string | null;
          class_id: string | null;
          assignment_id: string | null;
          question_id: string | null;
          teks_code: string | null;
          score: number | null;
          points_possible: number | null;
          percent: number | null;
          date_administered: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          teacher_id?: string | null;
          student_id?: string | null;
          class_id?: string | null;
          assignment_id?: string | null;
          question_id?: string | null;
          teks_code?: string | null;
          score?: number | null;
          points_possible?: number | null;
          percent?: number | null;
          date_administered?: string | null;
          created_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["evidence"]["Insert"]>;
        Relationships: [];
      };
      prior_staar_data: {
        Row: {
          id: string;
          teacher_id: string | null;
          student_id: string | null;
          prior_year: string | null;
          prior_test: string | null;
          prior_scale_score: number | null;
          prior_performance_level: string | null;
          prior_progress_measure: string | null;
          notes: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          teacher_id?: string | null;
          student_id?: string | null;
          prior_year?: string | null;
          prior_test?: string | null;
          prior_scale_score?: number | null;
          prior_performance_level?: string | null;
          prior_progress_measure?: string | null;
          notes?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["prior_staar_data"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"];
export type TablesInsert<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Update"];
