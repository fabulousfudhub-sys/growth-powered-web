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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      answers: {
        Row: {
          answer: string | null
          attempt_id: string
          essay_feedback: string | null
          essay_score: number | null
          id: string
          question_id: string
          saved_at: string | null
          synced: boolean | null
        }
        Insert: {
          answer?: string | null
          attempt_id: string
          essay_feedback?: string | null
          essay_score?: number | null
          id?: string
          question_id: string
          saved_at?: string | null
          synced?: boolean | null
        }
        Update: {
          answer?: string | null
          attempt_id?: string
          essay_feedback?: string | null
          essay_score?: number | null
          id?: string
          question_id?: string
          saved_at?: string | null
          synced?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "answers_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "exam_attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          category: string
          created_at: string | null
          details: string | null
          id: string
          ip_address: string | null
          role: string | null
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          action: string
          category: string
          created_at?: string | null
          details?: string | null
          id?: string
          ip_address?: string | null
          role?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          action?: string
          category?: string
          created_at?: string | null
          details?: string | null
          id?: string
          ip_address?: string | null
          role?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Relationships: []
      }
      courses: {
        Row: {
          code: string
          created_at: string | null
          department_id: string
          id: string
          instructor_id: string | null
          level: string | null
          programme: string | null
          school_id: string
          synced: boolean | null
          title: string
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          department_id: string
          id?: string
          instructor_id?: string | null
          level?: string | null
          programme?: string | null
          school_id: string
          synced?: boolean | null
          title: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          department_id?: string
          id?: string
          instructor_id?: string | null
          level?: string | null
          programme?: string | null
          school_id?: string
          synced?: boolean | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "courses_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courses_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courses_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          created_at: string | null
          examiner_id: string | null
          id: string
          levels: string[] | null
          name: string
          programmes: string[] | null
          school_id: string
          synced: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          examiner_id?: string | null
          id?: string
          levels?: string[] | null
          name: string
          programmes?: string[] | null
          school_id: string
          synced?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          examiner_id?: string | null
          id?: string
          levels?: string[] | null
          name?: string
          programmes?: string[] | null
          school_id?: string
          synced?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "departments_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_examiner"
            columns: ["examiner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_attempts: {
        Row: {
          created_at: string | null
          current_question: number | null
          exam_id: string
          id: string
          score: number | null
          started_at: string | null
          status: Database["public"]["Enums"]["attempt_status"]
          student_id: string
          submitted_at: string | null
          synced: boolean | null
          total_marks: number | null
        }
        Insert: {
          created_at?: string | null
          current_question?: number | null
          exam_id: string
          id?: string
          score?: number | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["attempt_status"]
          student_id: string
          submitted_at?: string | null
          synced?: boolean | null
          total_marks?: number | null
        }
        Update: {
          created_at?: string | null
          current_question?: number | null
          exam_id?: string
          id?: string
          score?: number | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["attempt_status"]
          student_id?: string
          submitted_at?: string | null
          synced?: boolean | null
          total_marks?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "exam_attempts_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_attempts_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_pins: {
        Row: {
          exam_id: string
          id: string
          pin: string
          student_id: string
          used: boolean | null
          used_at: string | null
        }
        Insert: {
          exam_id: string
          id?: string
          pin: string
          student_id: string
          used?: boolean | null
          used_at?: string | null
        }
        Update: {
          exam_id?: string
          id?: string
          pin?: string
          student_id?: string
          used?: boolean | null
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exam_pins_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_pins_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_questions: {
        Row: {
          exam_id: string
          question_id: string
          sort_order: number | null
        }
        Insert: {
          exam_id: string
          question_id: string
          sort_order?: number | null
        }
        Update: {
          exam_id?: string
          question_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "exam_questions_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_questions_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      exams: {
        Row: {
          course_id: string
          created_at: string | null
          created_by: string | null
          department_id: string
          duration: number
          end_date: string | null
          id: string
          instructions: string | null
          level: string | null
          pin_mode: string
          programme: string | null
          questions_to_answer: number
          school_id: string
          shared_pin: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["exam_status"]
          synced: boolean | null
          title: string
          total_marks: number
          total_questions: number
          updated_at: string | null
        }
        Insert: {
          course_id: string
          created_at?: string | null
          created_by?: string | null
          department_id: string
          duration: number
          end_date?: string | null
          id?: string
          instructions?: string | null
          level?: string | null
          pin_mode?: string
          programme?: string | null
          questions_to_answer: number
          school_id: string
          shared_pin?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["exam_status"]
          synced?: boolean | null
          title: string
          total_marks: number
          total_questions: number
          updated_at?: string | null
        }
        Update: {
          course_id?: string
          created_at?: string | null
          created_by?: string | null
          department_id?: string
          duration?: number
          end_date?: string | null
          id?: string
          instructions?: string | null
          level?: string | null
          pin_mode?: string
          programme?: string | null
          questions_to_answer?: number
          school_id?: string
          shared_pin?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["exam_status"]
          synced?: boolean | null
          title?: string
          total_marks?: number
          total_questions?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exams_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exams_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exams_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exams_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          correct_answer: Json | null
          course_id: string
          created_at: string | null
          created_by: string | null
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          id: string
          options: Json | null
          synced: boolean | null
          text: string
          type: Database["public"]["Enums"]["question_type"]
          updated_at: string | null
        }
        Insert: {
          correct_answer?: Json | null
          course_id: string
          created_at?: string | null
          created_by?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty_level"]
          id?: string
          options?: Json | null
          synced?: boolean | null
          text: string
          type: Database["public"]["Enums"]["question_type"]
          updated_at?: string | null
        }
        Update: {
          correct_answer?: Json | null
          course_id?: string
          created_at?: string | null
          created_by?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty_level"]
          id?: string
          options?: Json | null
          synced?: boolean | null
          text?: string
          type?: Database["public"]["Enums"]["question_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "questions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      schools: {
        Row: {
          created_at: string | null
          id: string
          name: string
          synced: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          synced?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          synced?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          id: number
          settings: Json
          updated_at: string | null
        }
        Insert: {
          id?: number
          settings?: Json
          updated_at?: string | null
        }
        Update: {
          id?: number
          settings?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      sync_log: {
        Row: {
          attempted_at: string | null
          created_at: string | null
          error_message: string | null
          id: string
          operation: string
          record_id: string
          status: string | null
          synced_at: string | null
          table_name: string
        }
        Insert: {
          attempted_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          operation: string
          record_id: string
          status?: string | null
          synced_at?: string | null
          table_name: string
        }
        Update: {
          attempted_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          operation?: string
          record_id?: string
          status?: string | null
          synced_at?: string | null
          table_name?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          department_id: string | null
          email: string | null
          id: string
          last_login: string | null
          level: string | null
          name: string
          password_hash: string | null
          reg_number: string | null
          role: Database["public"]["Enums"]["user_role"]
          synced: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          department_id?: string | null
          email?: string | null
          id?: string
          last_login?: string | null
          level?: string | null
          name: string
          password_hash?: string | null
          reg_number?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          synced?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          department_id?: string | null
          email?: string | null
          id?: string
          last_login?: string | null
          level?: string | null
          name?: string
          password_hash?: string | null
          reg_number?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          synced?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_password: {
        Args: { _hash: string; _password: string }
        Returns: boolean
      }
      hash_password: { Args: { _password: string }; Returns: string }
    }
    Enums: {
      attempt_status: "in_progress" | "submitted" | "graded"
      difficulty_level: "easy" | "medium" | "hard"
      exam_status: "draft" | "scheduled" | "active" | "completed"
      question_type:
        | "mcq"
        | "true_false"
        | "fill_blank"
        | "short_answer"
        | "essay"
        | "matching"
      user_role:
        | "super_admin"
        | "admin"
        | "examiner"
        | "instructor"
        | "lab_admin"
        | "student"
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
      attempt_status: ["in_progress", "submitted", "graded"],
      difficulty_level: ["easy", "medium", "hard"],
      exam_status: ["draft", "scheduled", "active", "completed"],
      question_type: [
        "mcq",
        "true_false",
        "fill_blank",
        "short_answer",
        "essay",
        "matching",
      ],
      user_role: [
        "super_admin",
        "admin",
        "examiner",
        "instructor",
        "lab_admin",
        "student",
      ],
    },
  },
} as const
