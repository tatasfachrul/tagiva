/**
 * Tagiva - TypeScript Supabase Database Definitions
 *
 * Generated to match PostgreSQL schema in supabase/migrations/20261027000001_init_tagiva_schema.sql
 * and specifications in DATABASE.md.
 */

import type { SupportedCurrency } from '../lib/domain/calculations';
import type { InvoiceStatus } from '../lib/domain/status';
import type { UserPlanState } from '../lib/domain/entitlements';

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          user_id: string;
          business_name: string;
          email: string;
          phone: string;
          address: string;
          tax_id: string;
          logo_url: string | null;
          invoice_prefix: string;
          default_currency: SupportedCurrency;
          default_language: 'en' | 'id';
          bank_details: {
            bank_name: string;
            account_number: string;
            account_holder: string;
            notes: string;
          };
          onboarding_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          business_name?: string;
          email?: string;
          phone?: string;
          address?: string;
          tax_id?: string;
          logo_url?: string | null;
          invoice_prefix?: string;
          default_currency?: SupportedCurrency;
          default_language?: 'en' | 'id';
          bank_details?: {
            bank_name: string;
            account_number: string;
            account_holder: string;
            notes: string;
          };
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          business_name?: string;
          email?: string;
          phone?: string;
          address?: string;
          tax_id?: string;
          logo_url?: string | null;
          invoice_prefix?: string;
          default_currency?: SupportedCurrency;
          default_language?: 'en' | 'id';
          bank_details?: {
            bank_name: string;
            account_number: string;
            account_holder: string;
            notes: string;
          };
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      invoice_sequences: {
        Row: {
          user_id: string;
          issue_year: number;
          last_seq: number;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          issue_year: number;
          last_seq?: number;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          issue_year?: number;
          last_seq?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      customers: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          company: string;
          email: string;
          address: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          company?: string;
          email?: string;
          address?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          company?: string;
          email?: string;
          address?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      invoices: {
        Row: {
          id: string;
          user_id: string;
          customer_id: string | null;
          template_id: string;
          invoice_number: string | null;
          status: InvoiceStatus;
          language: 'en' | 'id';
          currency: SupportedCurrency;
          issue_date: string;
          due_date: string;
          sender_name: string;
          sender_email: string;
          sender_phone: string;
          sender_address: string;
          sender_tax_id: string;
          logo_url: string | null;
          payment_instructions: Record<string, string>;
          client_name: string;
          client_company: string;
          client_email: string;
          client_address: string;
          subtotal: number;
          discount_type: 'percent' | 'fixed';
          discount_value: number;
          discount_amount: number;
          tax_label: string;
          tax_rate: number;
          tax_amount: number;
          total_amount: number;
          notes: string;
          public_token: string | null;
          public_link_enabled: boolean;
          issued_at: string | null;
          sent_at: string | null;
          paid_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          customer_id?: string | null;
          template_id?: string;
          invoice_number?: string | null;
          status?: InvoiceStatus;
          language?: 'en' | 'id';
          currency?: SupportedCurrency;
          issue_date?: string;
          due_date: string;
          sender_name?: string;
          sender_email?: string;
          sender_phone?: string;
          sender_address?: string;
          sender_tax_id?: string;
          logo_url?: string | null;
          payment_instructions?: Record<string, string>;
          client_name?: string;
          client_company?: string;
          client_email?: string;
          client_address?: string;
          subtotal?: number;
          discount_type?: 'percent' | 'fixed';
          discount_value?: number;
          discount_amount?: number;
          tax_label?: string;
          tax_rate?: number;
          tax_amount?: number;
          total_amount?: number;
          notes?: string;
          public_token?: string | null;
          public_link_enabled?: boolean;
          issued_at?: string | null;
          sent_at?: string | null;
          paid_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          customer_id?: string | null;
          template_id?: string;
          invoice_number?: string | null;
          status?: InvoiceStatus;
          language?: 'en' | 'id';
          currency?: SupportedCurrency;
          issue_date?: string;
          due_date?: string;
          sender_name?: string;
          sender_email?: string;
          sender_phone?: string;
          sender_address?: string;
          sender_tax_id?: string;
          logo_url?: string | null;
          payment_instructions?: Record<string, string>;
          client_name?: string;
          client_company?: string;
          client_email?: string;
          client_address?: string;
          subtotal?: number;
          discount_type?: 'percent' | 'fixed';
          discount_value?: number;
          discount_amount?: number;
          tax_label?: string;
          tax_rate?: number;
          tax_amount?: number;
          total_amount?: number;
          notes?: string;
          public_token?: string | null;
          public_link_enabled?: boolean;
          issued_at?: string | null;
          sent_at?: string | null;
          paid_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      invoice_items: {
        Row: {
          id: string;
          invoice_id: string;
          description: string;
          quantity: number;
          unit_price: number;
          line_total: number;
          sort_order: number;
        };
        Insert: {
          id?: string;
          invoice_id: string;
          description?: string;
          quantity?: number;
          unit_price?: number;
          line_total?: number;
          sort_order?: number;
        };
        Update: {
          id?: string;
          invoice_id?: string;
          description?: string;
          quantity?: number;
          unit_price?: number;
          line_total?: number;
          sort_order?: number;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan_duration_months: 1 | 3 | 6 | 12;
          billing_mode: 'manual' | 'auto_renew';
          status: 'active' | 'past_due' | 'expired' | 'cancelled';
          current_period_start: string;
          current_period_end: string;
          grace_period_end: string | null;
          gateway_provider: 'xendit' | 'midtrans' | 'mayar';
          gateway_customer_id: string | null;
          gateway_subscription_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan_duration_months: 1 | 3 | 6 | 12;
          billing_mode?: 'manual' | 'auto_renew';
          status?: 'active' | 'past_due' | 'expired' | 'cancelled';
          current_period_start: string;
          current_period_end: string;
          grace_period_end?: string | null;
          gateway_provider: 'xendit' | 'midtrans' | 'mayar';
          gateway_customer_id?: string | null;
          gateway_subscription_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          plan_duration_months?: 1 | 3 | 6 | 12;
          billing_mode?: 'manual' | 'auto_renew';
          status?: 'active' | 'past_due' | 'expired' | 'cancelled';
          current_period_start?: string;
          current_period_end?: string;
          grace_period_end?: string | null;
          gateway_provider?: 'xendit' | 'midtrans' | 'mayar';
          gateway_customer_id?: string | null;
          gateway_subscription_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      billing_events: {
        Row: {
          id: string;
          subscription_id: string | null;
          user_id: string;
          gateway_provider: string;
          gateway_event_id: string;
          event_type: string;
          duration_months: number | null;
          amount_idr: number | null;
          raw_payload: Json;
          processed_at: string;
        };
        Insert: {
          id?: string;
          subscription_id?: string | null;
          user_id: string;
          gateway_provider: string;
          gateway_event_id: string;
          event_type: string;
          duration_months?: number | null;
          amount_idr?: number | null;
          raw_payload: Json;
          processed_at?: string;
        };
        Update: {
          id?: string;
          subscription_id?: string | null;
          user_id?: string;
          gateway_provider?: string;
          gateway_event_id?: string;
          event_type?: string;
          duration_months?: number | null;
          amount_idr?: number | null;
          raw_payload?: Json;
          processed_at?: string;
        };
        Relationships: [];
      };
      subscription_reminders: {
        Row: {
          id: string;
          subscription_id: string;
          user_id: string;
          period_end_date_wib: string;
          reminder_type: '30d' | '14d' | '3d' | '0d' | 'auto_renew_3d';
          sent_at: string;
        };
        Insert: {
          id?: string;
          subscription_id: string;
          user_id: string;
          period_end_date_wib: string;
          reminder_type: '30d' | '14d' | '3d' | '0d' | 'auto_renew_3d';
          sent_at?: string;
        };
        Update: {
          id?: string;
          subscription_id?: string;
          user_id?: string;
          period_end_date_wib?: string;
          reminder_type?: '30d' | '14d' | '3d' | '0d' | 'auto_renew_3d';
          sent_at?: string;
        };
        Relationships: [];
      };
      invoice_email_logs: {
        Row: {
          id: string;
          user_id: string;
          invoice_id: string;
          recipient_email: string;
          sent_date_wib: string;
          resend_message_id: string | null;
          sent_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          invoice_id: string;
          recipient_email: string;
          sent_date_wib?: string;
          resend_message_id?: string | null;
          sent_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          invoice_id?: string;
          recipient_email?: string;
          sent_date_wib?: string;
          resend_message_id?: string | null;
          sent_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_user_plan_state: {
        Args: {
          p_user_id: string;
        };
        Returns: UserPlanState;
      };
      issue_invoice: {
        Args: {
          p_invoice_id: string;
        };
        Returns: string;
      };
      get_public_invoice_by_token: {
        Args: {
          p_token: string;
        };
        Returns: {
          invoice: Database['public']['Tables']['invoices']['Row'];
          items: Database['public']['Tables']['invoice_items']['Row'][];
          show_platform_footer: boolean;
        } | null;
      };
    };
    Enums: Record<string, never>;
  };
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

export type ProfileRow = Tables<'profiles'>;
export type InvoiceRow = Tables<'invoices'>;
export type InvoiceItemRow = Tables<'invoice_items'>;
export type CustomerRow = Tables<'customers'>;
export type SubscriptionRow = Tables<'subscriptions'>;
export type BillingEventRow = Tables<'billing_events'>;
export type SubscriptionReminderRow = Tables<'subscription_reminders'>;
export type InvoiceEmailLogRow = Tables<'invoice_email_logs'>;
export type InvoiceSequenceRow = Tables<'invoice_sequences'>;
