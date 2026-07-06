export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string | null
          password_hash: string
          role: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          name?: string | null
          password_hash: string
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string | null
          password_hash?: string
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          company_id: string
          created_at: string
          id: string
          ip_address: unknown
          new_data: Json | null
          old_data: Json | null
          record_id: string
          table_name: string
          user_agent: string | null
          user_email: string | null
          user_id: string | null
          user_role: string | null
        }
        Insert: {
          action: string
          company_id: string
          created_at?: string
          id?: string
          ip_address?: unknown
          new_data?: Json | null
          old_data?: Json | null
          record_id: string
          table_name: string
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
          user_role?: string | null
        }
        Update: {
          action?: string
          company_id?: string
          created_at?: string
          id?: string
          ip_address?: unknown
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string
          table_name?: string
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
          user_role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_requests: {
        Row: {
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          client_email: string
          client_name: string
          client_phone: string | null
          confirmed_end: string | null
          confirmed_start: string | null
          created_at: string | null
          desired_date: string
          desired_time: string | null
          event_type: string
          id: string
          num_guests: number | null
          rejection_reason: string | null
          special_requests: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          client_email: string
          client_name: string
          client_phone?: string | null
          confirmed_end?: string | null
          confirmed_start?: string | null
          created_at?: string | null
          desired_date: string
          desired_time?: string | null
          event_type: string
          id?: string
          num_guests?: number | null
          rejection_reason?: string | null
          special_requests?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          client_email?: string
          client_name?: string
          client_phone?: string | null
          confirmed_end?: string | null
          confirmed_start?: string | null
          created_at?: string | null
          desired_date?: string
          desired_time?: string | null
          event_type?: string
          id?: string
          num_guests?: number | null
          rejection_reason?: string | null
          special_requests?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      companies: {
        Row: {
          address: string
          created_at: string
          email: string
          id: string
          name: string
          staff_count: number
          updated_at: string
        }
        Insert: {
          address: string
          created_at?: string
          email: string
          id?: string
          name: string
          staff_count: number
          updated_at?: string
        }
        Update: {
          address?: string
          created_at?: string
          email?: string
          id?: string
          name?: string
          staff_count?: number
          updated_at?: string
        }
        Relationships: []
      }
      company_calendar_settings: {
        Row: {
          business_hours: Json | null
          closure_dates: Json | null
          company_id: string
          created_at: string | null
          fiscal_year_end: string | null
          fiscal_year_start: string | null
          id: string
          is_configured: boolean
          open_weekdays: number[] | null
          opening_hours: Json | null
          timezone: string | null
          updated_at: string | null
          working_days: number[]
          working_year_end: string
          working_year_start: string
        }
        Insert: {
          business_hours?: Json | null
          closure_dates?: Json | null
          company_id: string
          created_at?: string | null
          fiscal_year_end?: string | null
          fiscal_year_start?: string | null
          id?: string
          is_configured?: boolean
          open_weekdays?: number[] | null
          opening_hours?: Json | null
          timezone?: string | null
          updated_at?: string | null
          working_days?: number[]
          working_year_end?: string
          working_year_start?: string
        }
        Update: {
          business_hours?: Json | null
          closure_dates?: Json | null
          company_id?: string
          created_at?: string | null
          fiscal_year_end?: string | null
          fiscal_year_start?: string | null
          id?: string
          is_configured?: boolean
          open_weekdays?: number[] | null
          opening_hours?: Json | null
          timezone?: string | null
          updated_at?: string | null
          working_days?: number[]
          working_year_end?: string
          working_year_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_calendar_settings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_members: {
        Row: {
          company_id: string | null
          created_at: string
          id: string
          is_active: boolean
          joined_at: string
          role: string
          staff_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          joined_at?: string
          role: string
          staff_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          joined_at?: string
          role?: string
          staff_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_members_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_members_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      cons_point_custom_profile: {
        Row: {
          appliance_category: string
          company_id: string
          created_at: string
          id: string
          name: string
          profile_config: Json
          updated_at: string
        }
        Insert: {
          appliance_category: string
          company_id: string
          created_at?: string
          id?: string
          name: string
          profile_config: Json
          updated_at?: string
        }
        Update: {
          appliance_category?: string
          company_id?: string
          created_at?: string
          id?: string
          name?: string
          profile_config?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cons_point_custom_profile_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      conservation_points: {
        Row: {
          appliance_category: string | null
          company_id: string
          created_at: string
          department_id: string | null
          id: string
          is_blast_chiller: boolean
          is_custom_profile: boolean | null
          maintenance_due: string | null
          name: string
          product_categories: string[] | null
          profile_config: Json | null
          profile_id: string | null
          setpoint_temp: number
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          appliance_category?: string | null
          company_id: string
          created_at?: string
          department_id?: string | null
          id?: string
          is_blast_chiller?: boolean
          is_custom_profile?: boolean | null
          maintenance_due?: string | null
          name: string
          product_categories?: string[] | null
          profile_config?: Json | null
          profile_id?: string | null
          setpoint_temp: number
          status?: string
          type: string
          updated_at?: string
        }
        Update: {
          appliance_category?: string | null
          company_id?: string
          created_at?: string
          department_id?: string | null
          id?: string
          is_blast_chiller?: boolean
          is_custom_profile?: boolean | null
          maintenance_due?: string | null
          name?: string
          product_categories?: string[] | null
          profile_config?: Json | null
          profile_id?: string | null
          setpoint_temp?: number
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conservation_points_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conservation_points_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      csrf_tokens: {
        Row: {
          created_at: string | null
          created_by: string | null
          expires_at: string
          id: string
          ip_address: string | null
          token: string
          used_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          expires_at: string
          id?: string
          ip_address?: string | null
          token: string
          used_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          expires_at?: string
          id?: string
          ip_address?: string | null
          token?: string
          used_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      departments: {
        Row: {
          company_id: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "departments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      email_logs: {
        Row: {
          booking_id: string | null
          email_type: string
          error_message: string | null
          id: string
          provider_response: Json | null
          recipient_email: string
          sent_at: string | null
          status: string | null
        }
        Insert: {
          booking_id?: string | null
          email_type: string
          error_message?: string | null
          id?: string
          provider_response?: Json | null
          recipient_email: string
          sent_at?: string | null
          status?: string | null
        }
        Update: {
          booking_id?: string | null
          email_type?: string
          error_message?: string | null
          id?: string
          provider_response?: Json | null
          recipient_email?: string
          sent_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_logs_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "booking_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      email_schedule_logs: {
        Row: {
          company_id: string
          created_at: string | null
          email_schedule_id: string
          error_message: string | null
          id: string
          recipients_count: number
          sent_at: string | null
          status: string
        }
        Insert: {
          company_id: string
          created_at?: string | null
          email_schedule_id: string
          error_message?: string | null
          id?: string
          recipients_count?: number
          sent_at?: string | null
          status: string
        }
        Update: {
          company_id?: string
          created_at?: string | null
          email_schedule_id?: string
          error_message?: string | null
          id?: string
          recipients_count?: number
          sent_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_schedule_logs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_schedule_logs_email_schedule_id_fkey"
            columns: ["email_schedule_id"]
            isOneToOne: false
            referencedRelation: "email_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      email_schedules: {
        Row: {
          company_id: string
          created_at: string | null
          created_by: string | null
          email_template: string
          id: string
          is_active: boolean
          last_sent: string | null
          next_scheduled: string | null
          recipients: Json
          schedule_name: string
          schedule_type: string
          updated_at: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          created_by?: string | null
          email_template: string
          id?: string
          is_active?: boolean
          last_sent?: string | null
          next_scheduled?: string | null
          recipients?: Json
          schedule_name: string
          schedule_type: string
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          created_by?: string | null
          email_template?: string
          id?: string
          is_active?: boolean
          last_sent?: string | null
          next_scheduled?: string | null
          recipients?: Json
          schedule_name?: string
          schedule_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_schedules_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          company_id: string
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          start_date: string
          title: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          start_date: string
          title: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          start_date?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      haccp_configurations: {
        Row: {
          company_id: string
          configuration_name: string
          configuration_type: string
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean
          settings: Json
          updated_at: string | null
        }
        Insert: {
          company_id: string
          configuration_name: string
          configuration_type: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean
          settings?: Json
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          configuration_name?: string
          configuration_type?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean
          settings?: Json
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "haccp_configurations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_events: {
        Row: {
          company_id: string
          created_at: string | null
          event_date: string
          event_type: string
          id: string
          location_from: string | null
          location_to: string | null
          notes: string | null
          performed_by: string | null
          performed_by_name: string | null
          product_id: string | null
          quantity: number
          reason: string | null
          unit: string | null
          updated_at: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          event_date?: string
          event_type: string
          id?: string
          location_from?: string | null
          location_to?: string | null
          notes?: string | null
          performed_by?: string | null
          performed_by_name?: string | null
          product_id?: string | null
          quantity: number
          reason?: string | null
          unit?: string | null
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          event_date?: string
          event_type?: string
          id?: string
          location_from?: string | null
          location_to?: string | null
          notes?: string | null
          performed_by?: string | null
          performed_by_name?: string | null
          product_id?: string | null
          quantity?: number
          reason?: string | null
          unit?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_events_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_events_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      invite_tokens: {
        Row: {
          company_id: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string | null
          role: string
          staff_id: string | null
          token: string
          used_at: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          email: string
          expires_at: string
          id?: string
          invited_by?: string | null
          role: string
          staff_id?: string | null
          token: string
          used_at?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          role?: string
          staff_id?: string | null
          token?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invite_tokens_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invite_tokens_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_completions: {
        Row: {
          checklist_results: Json | null
          company_id: string
          completed_at: string
          completed_by: string | null
          completed_by_name: string | null
          completion_notes: string | null
          created_at: string | null
          id: string
          maintenance_task_id: string
          next_due_date: string | null
          photos: Json | null
          status: string
          updated_at: string | null
        }
        Insert: {
          checklist_results?: Json | null
          company_id: string
          completed_at?: string
          completed_by?: string | null
          completed_by_name?: string | null
          completion_notes?: string | null
          created_at?: string | null
          id?: string
          maintenance_task_id: string
          next_due_date?: string | null
          photos?: Json | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          checklist_results?: Json | null
          company_id?: string
          completed_at?: string
          completed_by?: string | null
          completed_by_name?: string | null
          completion_notes?: string | null
          created_at?: string | null
          id?: string
          maintenance_task_id?: string
          next_due_date?: string | null
          photos?: Json | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_completions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_completions_maintenance_task_id_fkey"
            columns: ["maintenance_task_id"]
            isOneToOne: false
            referencedRelation: "maintenance_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_tasks: {
        Row: {
          assigned_to: string
          assigned_to_category: string | null
          assigned_to_role: string | null
          assigned_to_staff_id: string | null
          assignment_type: string
          checklist: string[] | null
          company_id: string
          completed_at: string | null
          completed_by: string | null
          completion_notes: string | null
          conservation_point_id: string
          created_at: string
          description: string | null
          estimated_duration: number | null
          frequency: string
          id: string
          instructions: string[] | null
          last_completed: string | null
          next_due: string | null
          priority: string
          recurrence_config: Json | null
          required_tools: string[] | null
          safety_notes: string[] | null
          status: string
          title: string | null
          type: string
          updated_at: string
        }
        Insert: {
          assigned_to: string
          assigned_to_category?: string | null
          assigned_to_role?: string | null
          assigned_to_staff_id?: string | null
          assignment_type: string
          checklist?: string[] | null
          company_id: string
          completed_at?: string | null
          completed_by?: string | null
          completion_notes?: string | null
          conservation_point_id: string
          created_at?: string
          description?: string | null
          estimated_duration?: number | null
          frequency: string
          id?: string
          instructions?: string[] | null
          last_completed?: string | null
          next_due?: string | null
          priority?: string
          recurrence_config?: Json | null
          required_tools?: string[] | null
          safety_notes?: string[] | null
          status?: string
          title?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string
          assigned_to_category?: string | null
          assigned_to_role?: string | null
          assigned_to_staff_id?: string | null
          assignment_type?: string
          checklist?: string[] | null
          company_id?: string
          completed_at?: string | null
          completed_by?: string | null
          completion_notes?: string | null
          conservation_point_id?: string
          created_at?: string
          description?: string | null
          estimated_duration?: number | null
          frequency?: string
          id?: string
          instructions?: string[] | null
          last_completed?: string | null
          next_due?: string | null
          priority?: string
          recurrence_config?: Json | null
          required_tools?: string[] | null
          safety_notes?: string[] | null
          status?: string
          title?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_tasks_assigned_to_staff_id_fkey"
            columns: ["assigned_to_staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_tasks_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_tasks_conservation_point_id_fkey"
            columns: ["conservation_point_id"]
            isOneToOne: false
            referencedRelation: "conservation_points"
            referencedColumns: ["id"]
          },
        ]
      }
      meetings: {
        Row: {
          action_items: Json | null
          agenda: Json | null
          attendees: Json | null
          company_id: string
          created_at: string | null
          created_by: string | null
          description: string | null
          duration_minutes: number
          id: string
          location: string | null
          meeting_notes: string | null
          meeting_type: string
          scheduled_date: string
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          action_items?: Json | null
          agenda?: Json | null
          attendees?: Json | null
          company_id: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          duration_minutes?: number
          id?: string
          location?: string | null
          meeting_notes?: string | null
          meeting_type: string
          scheduled_date: string
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          action_items?: Json | null
          agenda?: Json | null
          attendees?: Json | null
          company_id?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          duration_minutes?: number
          id?: string
          location?: string | null
          meeting_notes?: string | null
          meeting_type?: string
          scheduled_date?: string
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meetings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      non_conformities: {
        Row: {
          company_id: string
          created_at: string
          description: string
          id: string
          severity: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          description: string
          id?: string
          severity: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          description?: string
          id?: string
          severity?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "non_conformities_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      notes: {
        Row: {
          company_id: string
          content: string
          created_at: string
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          company_id: string
          content: string
          created_at?: string
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          content?: string
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notes_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      product_categories: {
        Row: {
          company_id: string
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_categories_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      product_expiry_completions: {
        Row: {
          action: string
          company_id: string
          completed_at: string
          completed_by: string | null
          completed_by_name: string | null
          created_at: string | null
          id: string
          notes: string | null
          product_id: string
          updated_at: string | null
        }
        Insert: {
          action?: string
          company_id: string
          completed_at?: string
          completed_by?: string | null
          completed_by_name?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          product_id: string
          updated_at?: string | null
        }
        Update: {
          action?: string
          company_id?: string
          completed_at?: string
          completed_by?: string | null
          completed_by_name?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          product_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_expiry_completions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_expiry_completions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          allergens: string[] | null
          barcode: string | null
          category_id: string | null
          company_id: string
          compliance_status: string | null
          conservation_point_id: string | null
          created_at: string
          department_id: string | null
          expiry_date: string | null
          id: string
          label_photo_url: string | null
          name: string
          notes: string | null
          purchase_date: string | null
          quantity: number | null
          sku: string | null
          status: string
          supplier_name: string | null
          unit: string | null
          updated_at: string
        }
        Insert: {
          allergens?: string[] | null
          barcode?: string | null
          category_id?: string | null
          company_id: string
          compliance_status?: string | null
          conservation_point_id?: string | null
          created_at?: string
          department_id?: string | null
          expiry_date?: string | null
          id?: string
          label_photo_url?: string | null
          name: string
          notes?: string | null
          purchase_date?: string | null
          quantity?: number | null
          sku?: string | null
          status?: string
          supplier_name?: string | null
          unit?: string | null
          updated_at?: string
        }
        Update: {
          allergens?: string[] | null
          barcode?: string | null
          category_id?: string | null
          company_id?: string
          compliance_status?: string | null
          conservation_point_id?: string | null
          created_at?: string
          department_id?: string | null
          expiry_date?: string | null
          id?: string
          label_photo_url?: string | null
          name?: string
          notes?: string | null
          purchase_date?: string | null
          quantity?: number | null
          sku?: string | null
          status?: string
          supplier_name?: string | null
          unit?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_conservation_point_id_fkey"
            columns: ["conservation_point_id"]
            isOneToOne: false
            referencedRelation: "conservation_points"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_settings: {
        Row: {
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string | null
        }
        Insert: {
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string | null
        }
        Update: {
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      shopping_list_items: {
        Row: {
          added_at: string
          category_name: string
          checked_at: string | null
          completed_at: string | null
          created_at: string
          id: string
          is_checked: boolean
          is_completed: boolean
          notes: string | null
          product_id: string | null
          product_name: string
          quantity: number
          shopping_list_id: string
          unit: string | null
          updated_at: string
        }
        Insert: {
          added_at?: string
          category_name: string
          checked_at?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          is_checked?: boolean
          is_completed?: boolean
          notes?: string | null
          product_id?: string | null
          product_name: string
          quantity?: number
          shopping_list_id: string
          unit?: string | null
          updated_at?: string
        }
        Update: {
          added_at?: string
          category_name?: string
          checked_at?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          is_checked?: boolean
          is_completed?: boolean
          notes?: string | null
          product_id?: string | null
          product_name?: string
          quantity?: number
          shopping_list_id?: string
          unit?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shopping_list_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shopping_list_items_shopping_list_id_fkey"
            columns: ["shopping_list_id"]
            isOneToOne: false
            referencedRelation: "shopping_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      shopping_lists: {
        Row: {
          company_id: string
          completed_at: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_completed: boolean
          is_template: boolean
          name: string
          notes: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          company_id: string
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_completed?: boolean
          is_template?: boolean
          name: string
          notes?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          company_id?: string
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_completed?: boolean
          is_template?: boolean
          name?: string
          notes?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shopping_lists_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      staff: {
        Row: {
          category: string
          company_id: string
          created_at: string
          department_assignments: string[] | null
          email: string | null
          haccp_certification: Json | null
          hire_date: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          role: string
          status: string
          updated_at: string
        }
        Insert: {
          category: string
          company_id: string
          created_at?: string
          department_assignments?: string[] | null
          email?: string | null
          haccp_certification?: Json | null
          hire_date?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          role: string
          status?: string
          updated_at?: string
        }
        Update: {
          category?: string
          company_id?: string
          created_at?: string
          department_assignments?: string[] | null
          email?: string | null
          haccp_certification?: Json | null
          hire_date?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          role?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      task_completions: {
        Row: {
          company_id: string
          completed_at: string
          completed_by: string | null
          completed_by_name: string | null
          created_at: string
          id: string
          notes: string | null
          period_end: string
          period_start: string
          task_id: string
          updated_at: string
        }
        Insert: {
          company_id: string
          completed_at?: string
          completed_by?: string | null
          completed_by_name?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          period_end: string
          period_start: string
          task_id: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          completed_at?: string
          completed_by?: string | null
          completed_by_name?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          period_end?: string
          period_start?: string
          task_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_completions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_completions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assigned_to: string
          assigned_to_category: string | null
          assigned_to_role: string | null
          assigned_to_staff_id: string | null
          assignment_type: string
          checklist: string[] | null
          company_id: string
          conservation_point_id: string | null
          created_at: string
          department_id: string | null
          description: string | null
          documentation_url: string | null
          estimated_duration: number | null
          frequency: string
          haccp_category: string | null
          id: string
          name: string
          next_due: string | null
          priority: string
          recurrence_config: Json | null
          required_tools: string[] | null
          status: string
          time_management: Json | null
          updated_at: string
          validation_notes: string | null
        }
        Insert: {
          assigned_to: string
          assigned_to_category?: string | null
          assigned_to_role?: string | null
          assigned_to_staff_id?: string | null
          assignment_type: string
          checklist?: string[] | null
          company_id: string
          conservation_point_id?: string | null
          created_at?: string
          department_id?: string | null
          description?: string | null
          documentation_url?: string | null
          estimated_duration?: number | null
          frequency: string
          haccp_category?: string | null
          id?: string
          name: string
          next_due?: string | null
          priority?: string
          recurrence_config?: Json | null
          required_tools?: string[] | null
          status?: string
          time_management?: Json | null
          updated_at?: string
          validation_notes?: string | null
        }
        Update: {
          assigned_to?: string
          assigned_to_category?: string | null
          assigned_to_role?: string | null
          assigned_to_staff_id?: string | null
          assignment_type?: string
          checklist?: string[] | null
          company_id?: string
          conservation_point_id?: string | null
          created_at?: string
          department_id?: string | null
          description?: string | null
          documentation_url?: string | null
          estimated_duration?: number | null
          frequency?: string
          haccp_category?: string | null
          id?: string
          name?: string
          next_due?: string | null
          priority?: string
          recurrence_config?: Json | null
          required_tools?: string[] | null
          status?: string
          time_management?: Json | null
          updated_at?: string
          validation_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_to_staff_id_fkey"
            columns: ["assigned_to_staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_conservation_point_id_fkey"
            columns: ["conservation_point_id"]
            isOneToOne: false
            referencedRelation: "conservation_points"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      temperature_readings: {
        Row: {
          company_id: string
          conservation_point_id: string
          created_at: string
          id: string
          recorded_at: string
          temperature: number
        }
        Insert: {
          company_id: string
          conservation_point_id: string
          created_at?: string
          id?: string
          recorded_at: string
          temperature: number
        }
        Update: {
          company_id?: string
          conservation_point_id?: string
          created_at?: string
          id?: string
          recorded_at?: string
          temperature?: number
        }
        Relationships: [
          {
            foreignKeyName: "temperature_readings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "temperature_readings_conservation_point_id_fkey"
            columns: ["conservation_point_id"]
            isOneToOne: false
            referencedRelation: "conservation_points"
            referencedColumns: ["id"]
          },
        ]
      }
      training_sessions: {
        Row: {
          company_id: string
          created_at: string | null
          created_by: string | null
          description: string | null
          duration_minutes: number
          id: string
          instructor: string | null
          location: string | null
          materials: Json | null
          max_participants: number | null
          participants: Json | null
          scheduled_date: string
          status: string
          title: string
          training_type: string
          updated_at: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          duration_minutes?: number
          id?: string
          instructor?: string | null
          location?: string | null
          materials?: Json | null
          max_participants?: number | null
          participants?: Json | null
          scheduled_date: string
          status?: string
          title: string
          training_type: string
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          duration_minutes?: number
          id?: string
          instructor?: string | null
          location?: string | null
          materials?: Json | null
          max_participants?: number | null
          participants?: Json | null
          scheduled_date?: string
          status?: string
          title?: string
          training_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "training_sessions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activity_logs: {
        Row: {
          activity_data: Json | null
          activity_type: string
          company_id: string
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: unknown
          session_id: string | null
          timestamp: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          activity_data?: Json | null
          activity_type: string
          company_id: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: unknown
          session_id?: string | null
          timestamp?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          activity_data?: Json | null
          activity_type?: string
          company_id?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: unknown
          session_id?: string | null
          timestamp?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_activity_logs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_activity_logs_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "user_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          company_id: string | null
          created_at: string | null
          id: string
          preference_key: string
          preference_value: Json
          updated_at: string | null
          user_id: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          id?: string
          preference_key: string
          preference_value: Json
          updated_at?: string | null
          user_id: string
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          id?: string
          preference_key?: string
          preference_value?: Json
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          auth_user_id: string | null
          clerk_user_id: string | null
          company_id: string | null
          created_at: string
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          role: string
          staff_id: string | null
          updated_at: string
        }
        Insert: {
          auth_user_id?: string | null
          clerk_user_id?: string | null
          company_id?: string | null
          created_at?: string
          email: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          role?: string
          staff_id?: string | null
          updated_at?: string
        }
        Update: {
          auth_user_id?: string | null
          clerk_user_id?: string | null
          company_id?: string | null
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          role?: string
          staff_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_profiles_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      user_sessions: {
        Row: {
          active_company_id: string | null
          created_at: string
          id: string
          ip_address: unknown
          is_active: boolean
          last_activity: string
          session_end: string | null
          session_start: string
          updated_at: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          active_company_id?: string | null
          created_at?: string
          id?: string
          ip_address?: unknown
          is_active?: boolean
          last_activity?: string
          session_end?: string | null
          session_start?: string
          updated_at?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          active_company_id?: string | null
          created_at?: string
          id?: string
          ip_address?: unknown
          is_active?: boolean
          last_activity?: string
          session_end?: string | null
          session_start?: string
          updated_at?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_active_company_id_fkey"
            columns: ["active_company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_next_due_date: {
        Args: { p_completed_at: string; p_frequency: string }
        Returns: string
      }
      cleanup_expired_csrf_tokens: { Args: never; Returns: undefined }
      ensure_user_session: { Args: never; Returns: string }
      get_active_company_id: { Args: never; Returns: string }
      get_user_companies: {
        Args: never
        Returns: {
          company_id: string
          company_name: string
          is_active: boolean
          user_role: string
        }[]
      }
      get_user_role_for_company: {
        Args: { p_company_id: string }
        Returns: string
      }
      has_management_role: { Args: { p_company_id: string }; Returns: boolean }
      has_permission: {
        Args: { p_company_id: string; p_permission: string }
        Returns: boolean
      }
      is_admin: { Args: { p_company_id: string }; Returns: boolean }
      is_company_member: { Args: { p_company_id: string }; Returns: boolean }
      switch_active_company: {
        Args: { p_new_company_id: string }
        Returns: boolean
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

