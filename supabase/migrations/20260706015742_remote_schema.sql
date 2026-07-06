


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."calculate_next_due_date"("p_frequency" character varying, "p_completed_at" timestamp with time zone) RETURNS timestamp with time zone
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  CASE p_frequency
    WHEN 'daily' THEN
      RETURN p_completed_at + INTERVAL '1 day';
    WHEN 'weekly' THEN
      RETURN p_completed_at + INTERVAL '7 days';
    WHEN 'monthly' THEN
      RETURN p_completed_at + INTERVAL '1 month';
    WHEN 'annually' THEN
      RETURN p_completed_at + INTERVAL '1 year';
    ELSE
      -- Default: se frequency non riconosciuta, +1 giorno
      RETURN p_completed_at + INTERVAL '1 day';
  END CASE;
END;
$$;


ALTER FUNCTION "public"."calculate_next_due_date"("p_frequency" character varying, "p_completed_at" timestamp with time zone) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."calculate_next_due_date"("p_frequency" character varying, "p_completed_at" timestamp with time zone) IS 'Calcola la prossima scadenza di un task ricorrente in base alla frequency (daily/weekly/monthly/annually)';



CREATE OR REPLACE FUNCTION "public"."cleanup_expired_csrf_tokens"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    DELETE FROM csrf_tokens 
    WHERE expires_at < NOW() - INTERVAL '1 hour';
END;
$$;


ALTER FUNCTION "public"."cleanup_expired_csrf_tokens"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."ensure_user_session"() RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_user_id uuid;
  v_company_id uuid;
  v_session_id uuid;
BEGIN
  -- Get authenticated user
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RETURN NULL;
  END IF;

  -- Check if session already exists
  SELECT active_company_id INTO v_company_id
  FROM user_sessions
  WHERE user_id = v_user_id;

  IF FOUND THEN
    -- Update last activity
    UPDATE user_sessions
    SET last_activity = now()
    WHERE user_id = v_user_id;

    RETURN v_company_id;
  END IF;

  -- Get first company of user
  SELECT company_id INTO v_company_id
  FROM company_members
  WHERE user_id = v_user_id
    AND is_active = true
  ORDER BY joined_at ASC
  LIMIT 1;

  -- Create new session
  INSERT INTO user_sessions (user_id, active_company_id)
  VALUES (v_user_id, v_company_id)
  RETURNING id INTO v_session_id;

  RETURN v_company_id;
END;
$$;


ALTER FUNCTION "public"."ensure_user_session"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."ensure_user_session"() IS 'Auto-creates user session on first login. Selects first company as active.';



CREATE OR REPLACE FUNCTION "public"."get_active_company_id"() RETURNS "uuid"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT active_company_id
  FROM user_sessions
  WHERE user_id = auth.uid()
  LIMIT 1;
$$;


ALTER FUNCTION "public"."get_active_company_id"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_active_company_id"() IS 'Returns the currently active company_id for the authenticated user. Used by RLS policies to filter data.';



CREATE OR REPLACE FUNCTION "public"."get_user_companies"() RETURNS TABLE("company_id" "uuid", "company_name" character varying, "user_role" character varying, "is_active" boolean)
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT
    cm.company_id,
    c.name as company_name,
    cm.role as user_role,
    cm.is_active
  FROM company_members cm
  JOIN companies c ON c.id = cm.company_id
  WHERE cm.user_id = auth.uid()
    AND cm.is_active = true
  ORDER BY cm.joined_at ASC;
$$;


ALTER FUNCTION "public"."get_user_companies"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_user_companies"() IS 'Returns all active companies for authenticated user. Used for company switcher UI.';



CREATE OR REPLACE FUNCTION "public"."get_user_role_for_company"("p_company_id" "uuid") RETURNS character varying
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT role
  FROM company_members
  WHERE user_id = auth.uid()
    AND company_id = p_company_id
    AND is_active = true
  LIMIT 1;
$$;


ALTER FUNCTION "public"."get_user_role_for_company"("p_company_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_user_role_for_company"("p_company_id" "uuid") IS 'Returns user role for specified company. Returns NULL if not a member.';



CREATE OR REPLACE FUNCTION "public"."has_management_role"("p_company_id" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT EXISTS(
    SELECT 1
    FROM company_members
    WHERE user_id = auth.uid()
      AND company_id = p_company_id
      AND role IN ('admin', 'responsabile')
      AND is_active = true
  );
$$;


ALTER FUNCTION "public"."has_management_role"("p_company_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."has_management_role"("p_company_id" "uuid") IS 'Checks if user has admin or responsabile role for company. Used for write permissions.';



CREATE OR REPLACE FUNCTION "public"."has_permission"("p_company_id" "uuid", "p_permission" character varying) RETURNS boolean
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_role varchar;
BEGIN
  -- Get user role
  SELECT role INTO v_role
  FROM company_members
  WHERE user_id = auth.uid()
    AND company_id = p_company_id
    AND is_active = true;

  IF v_role IS NULL THEN
    RETURN false;
  END IF;

  -- Check permission based on role
  CASE p_permission
    WHEN 'manage_staff' THEN
      RETURN v_role IN ('admin', 'responsabile');
    WHEN 'manage_departments' THEN
      RETURN v_role IN ('admin', 'responsabile');
    WHEN 'view_all_tasks' THEN
      RETURN v_role IN ('admin', 'responsabile');
    WHEN 'manage_conservation' THEN
      RETURN v_role IN ('admin', 'responsabile');
    WHEN 'export_data' THEN
      RETURN v_role = 'admin';
    WHEN 'manage_settings' THEN
      RETURN v_role = 'admin';
    ELSE
      RETURN false;
  END CASE;
END;
$$;


ALTER FUNCTION "public"."has_permission"("p_company_id" "uuid", "p_permission" character varying) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."has_permission"("p_company_id" "uuid", "p_permission" character varying) IS 'Generic permission checker. Supports: manage_staff, manage_departments, view_all_tasks, manage_conservation, export_data, manage_settings';



CREATE OR REPLACE FUNCTION "public"."is_admin"("p_company_id" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT EXISTS(
    SELECT 1
    FROM company_members
    WHERE user_id = auth.uid()
      AND company_id = p_company_id
      AND role = 'admin'
      AND is_active = true
  );
$$;


ALTER FUNCTION "public"."is_admin"("p_company_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."is_admin"("p_company_id" "uuid") IS 'Checks if user has admin role for company. Used for sensitive operations (export, settings).';



CREATE OR REPLACE FUNCTION "public"."is_company_member"("p_company_id" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT EXISTS(
    SELECT 1
    FROM company_members
    WHERE user_id = auth.uid()
      AND company_id = p_company_id
      AND is_active = true
  );
$$;


ALTER FUNCTION "public"."is_company_member"("p_company_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."is_company_member"("p_company_id" "uuid") IS 'Checks if authenticated user is an active member of the specified company.';



CREATE OR REPLACE FUNCTION "public"."switch_active_company"("p_new_company_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_user_id uuid;
  v_is_member boolean;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Verify user is member of target company
  SELECT is_company_member(p_new_company_id) INTO v_is_member;

  IF NOT v_is_member THEN
    RAISE EXCEPTION 'Not authorized for company %', p_new_company_id;
  END IF;

  -- Update session
  UPDATE user_sessions
  SET active_company_id = p_new_company_id,
      last_activity = now(),
      updated_at = now()
  WHERE user_id = v_user_id;

  IF NOT FOUND THEN
    -- Create session if doesn't exist
    INSERT INTO user_sessions (user_id, active_company_id)
    VALUES (v_user_id, p_new_company_id);
  END IF;

  RETURN true;
END;
$$;


ALTER FUNCTION "public"."switch_active_company"("p_new_company_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."switch_active_company"("p_new_company_id" "uuid") IS 'Switches active company for user. Validates membership before switching.';



CREATE OR REPLACE FUNCTION "public"."trigger_cleanup_csrf_tokens"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    PERFORM cleanup_expired_csrf_tokens();
    RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."trigger_cleanup_csrf_tokens"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_company_calendar_settings_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_company_calendar_settings_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_maintenance_task_on_completion"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  v_task_frequency VARCHAR;
  v_new_next_due TIMESTAMPTZ;
BEGIN
  -- Leggi la frequency del task
  SELECT frequency INTO v_task_frequency
  FROM maintenance_tasks
  WHERE id = NEW.maintenance_task_id;

  -- Calcola la prossima scadenza
  v_new_next_due := calculate_next_due_date(v_task_frequency, NEW.completed_at);

  -- Aggiorna il task con:
  -- 1. last_completed = data completion
  -- 2. next_due = prossima scadenza calcolata
  -- 3. status = 'scheduled' (resetta per il prossimo ciclo)
  UPDATE maintenance_tasks
  SET
    last_completed = NEW.completed_at,
    next_due = v_new_next_due,
    status = 'scheduled',
    updated_at = NOW()
  WHERE id = NEW.maintenance_task_id;

  -- Log per debug (opzionale)
  RAISE NOTICE 'Task % aggiornato: next_due = %, status = scheduled',
    NEW.maintenance_task_id, v_new_next_due;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_maintenance_task_on_completion"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."update_maintenance_task_on_completion"() IS 'Trigger function: quando viene creato un completamento, aggiorna automaticamente last_completed, next_due e status del task';



CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."admin_users" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "email" character varying(255) NOT NULL,
    "password_hash" "text" NOT NULL,
    "role" character varying(50) DEFAULT 'admin'::character varying,
    "name" character varying(255),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "admin_users_role_check" CHECK ((("role")::"text" = ANY (ARRAY[('admin'::character varying)::"text", ('staff'::character varying)::"text"])))
);


ALTER TABLE "public"."admin_users" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."audit_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "company_id" "uuid" NOT NULL,
    "table_name" character varying NOT NULL,
    "record_id" "uuid" NOT NULL,
    "action" character varying NOT NULL,
    "old_data" "jsonb",
    "new_data" "jsonb",
    "user_role" character varying,
    "user_email" character varying,
    "ip_address" "inet",
    "user_agent" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "audit_logs_action_check" CHECK ((("action")::"text" = ANY (ARRAY[('INSERT'::character varying)::"text", ('UPDATE'::character varying)::"text", ('DELETE'::character varying)::"text", ('COMPLETE'::character varying)::"text", ('APPROVE'::character varying)::"text", ('REJECT'::character varying)::"text"])))
);


ALTER TABLE "public"."audit_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."booking_requests" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "client_name" character varying(255) NOT NULL,
    "client_email" character varying(255) NOT NULL,
    "client_phone" character varying(50),
    "event_type" character varying(100) NOT NULL,
    "desired_date" "date" NOT NULL,
    "desired_time" time without time zone,
    "num_guests" integer,
    "special_requests" "text",
    "status" character varying(50) DEFAULT 'pending'::character varying,
    "confirmed_start" timestamp with time zone,
    "confirmed_end" timestamp with time zone,
    "rejection_reason" "text",
    "cancellation_reason" "text",
    "cancelled_at" timestamp with time zone,
    "cancelled_by" "uuid",
    CONSTRAINT "booking_requests_status_check" CHECK ((("status")::"text" = ANY (ARRAY[('pending'::character varying)::"text", ('accepted'::character varying)::"text", ('rejected'::character varying)::"text", ('cancelled'::character varying)::"text"])))
);


ALTER TABLE "public"."booking_requests" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."companies" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying NOT NULL,
    "address" "text" NOT NULL,
    "staff_count" integer NOT NULL,
    "email" character varying NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "companies_staff_count_check" CHECK (("staff_count" >= 0))
);


ALTER TABLE "public"."companies" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."company_calendar_settings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "working_year_start" "date" DEFAULT '2025-01-01'::"date" NOT NULL,
    "working_year_end" "date" DEFAULT '2025-12-31'::"date" NOT NULL,
    "working_days" integer[] DEFAULT '{1,2,3,4,5,6}'::integer[] NOT NULL,
    "closure_dates" "jsonb" DEFAULT '[]'::"jsonb",
    "opening_hours" "jsonb" DEFAULT '{}'::"jsonb",
    "timezone" "text" DEFAULT 'Europe/Rome'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "business_hours" "jsonb",
    "fiscal_year_end" "date",
    "fiscal_year_start" "date",
    "is_configured" boolean DEFAULT false NOT NULL,
    "open_weekdays" integer[] DEFAULT '{1,2,3,4,5,6}'::integer[]
);


ALTER TABLE "public"."company_calendar_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."company_members" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "company_id" "uuid",
    "role" character varying NOT NULL,
    "staff_id" "uuid",
    "is_active" boolean DEFAULT true NOT NULL,
    "joined_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "company_members_role_check" CHECK ((("role")::"text" = ANY (ARRAY[('admin'::character varying)::"text", ('responsabile'::character varying)::"text", ('dipendente'::character varying)::"text", ('collaboratore'::character varying)::"text"])))
);


ALTER TABLE "public"."company_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."cons_point_custom_profile" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "name" character varying NOT NULL,
    "appliance_category" character varying NOT NULL,
    "profile_config" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."cons_point_custom_profile" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."conservation_points" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "department_id" "uuid",
    "name" character varying NOT NULL,
    "setpoint_temp" numeric NOT NULL,
    "type" character varying NOT NULL,
    "product_categories" "text"[] DEFAULT '{}'::"text"[],
    "is_blast_chiller" boolean DEFAULT false NOT NULL,
    "status" character varying DEFAULT 'normal'::character varying NOT NULL,
    "maintenance_due" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "appliance_category" character varying,
    "profile_id" character varying,
    "profile_config" "jsonb",
    "is_custom_profile" boolean DEFAULT false,
    CONSTRAINT "conservation_points_status_check" CHECK ((("status")::"text" = ANY (ARRAY[('normal'::character varying)::"text", ('warning'::character varying)::"text", ('critical'::character varying)::"text"]))),
    CONSTRAINT "conservation_points_type_check" CHECK ((("type")::"text" = ANY (ARRAY[('ambient'::character varying)::"text", ('fridge'::character varying)::"text", ('freezer'::character varying)::"text", ('blast'::character varying)::"text"])))
);


ALTER TABLE "public"."conservation_points" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."csrf_tokens" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "token" "text" NOT NULL,
    "expires_at" timestamp with time zone NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "ip_address" "text",
    "user_id" "uuid",
    "used_at" timestamp with time zone,
    "created_by" "text" DEFAULT 'system'::"text"
);


ALTER TABLE "public"."csrf_tokens" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."departments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "name" character varying NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."departments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."email_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "booking_id" "uuid",
    "email_type" character varying(50) NOT NULL,
    "recipient_email" character varying(255) NOT NULL,
    "sent_at" timestamp with time zone DEFAULT "now"(),
    "status" character varying(50) DEFAULT 'sent'::character varying,
    "provider_response" "jsonb",
    "error_message" "text",
    CONSTRAINT "email_logs_status_check" CHECK ((("status")::"text" = ANY (ARRAY[('sent'::character varying)::"text", ('failed'::character varying)::"text", ('pending'::character varying)::"text"])))
);


ALTER TABLE "public"."email_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."email_schedule_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "email_schedule_id" "uuid" NOT NULL,
    "company_id" "uuid" NOT NULL,
    "status" character varying NOT NULL,
    "recipients_count" integer DEFAULT 0 NOT NULL,
    "error_message" "text",
    "sent_at" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "email_schedule_logs_status_check" CHECK ((("status")::"text" = ANY (ARRAY[('sent'::character varying)::"text", ('failed'::character varying)::"text", ('pending'::character varying)::"text"])))
);


ALTER TABLE "public"."email_schedule_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."email_schedules" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "schedule_name" character varying NOT NULL,
    "schedule_type" character varying NOT NULL,
    "email_template" character varying NOT NULL,
    "recipients" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "last_sent" timestamp with time zone,
    "next_scheduled" timestamp with time zone,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "email_schedules_schedule_type_check" CHECK ((("schedule_type")::"text" = ANY (ARRAY[('daily'::character varying)::"text", ('weekly'::character varying)::"text", ('monthly'::character varying)::"text", ('quarterly'::character varying)::"text", ('custom'::character varying)::"text"])))
);


ALTER TABLE "public"."email_schedules" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "title" character varying NOT NULL,
    "description" "text",
    "start_date" timestamp with time zone NOT NULL,
    "end_date" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."haccp_configurations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "configuration_name" character varying NOT NULL,
    "configuration_type" character varying NOT NULL,
    "settings" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "haccp_configurations_configuration_type_check" CHECK ((("configuration_type")::"text" = ANY (ARRAY[('temperature_monitoring'::character varying)::"text", ('sanitization_procedures'::character varying)::"text", ('staff_training'::character varying)::"text", ('documentation'::character varying)::"text", ('audit_schedule'::character varying)::"text", ('corrective_actions'::character varying)::"text"])))
);


ALTER TABLE "public"."haccp_configurations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."inventory_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "event_type" character varying NOT NULL,
    "product_id" "uuid",
    "quantity" numeric NOT NULL,
    "unit" character varying,
    "location_from" character varying,
    "location_to" character varying,
    "reason" "text",
    "performed_by" "uuid",
    "performed_by_name" character varying,
    "event_date" timestamp with time zone DEFAULT "now"() NOT NULL,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "inventory_events_event_type_check" CHECK ((("event_type")::"text" = ANY (ARRAY[('stock_in'::character varying)::"text", ('stock_out'::character varying)::"text", ('transfer'::character varying)::"text", ('adjustment'::character varying)::"text", ('expiry'::character varying)::"text", ('disposal'::character varying)::"text"])))
);


ALTER TABLE "public"."inventory_events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."invite_tokens" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "token" character varying NOT NULL,
    "email" character varying NOT NULL,
    "company_id" "uuid",
    "role" character varying NOT NULL,
    "staff_id" "uuid",
    "invited_by" "uuid",
    "expires_at" timestamp with time zone NOT NULL,
    "used_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "invite_tokens_check" CHECK (("expires_at" > "created_at")),
    CONSTRAINT "invite_tokens_role_check" CHECK ((("role")::"text" = ANY (ARRAY[('admin'::character varying)::"text", ('responsabile'::character varying)::"text", ('dipendente'::character varying)::"text", ('collaboratore'::character varying)::"text"]))),
    CONSTRAINT "invite_tokens_used_at_check" CHECK ((("used_at" IS NULL) OR ("used_at" <= "now"())))
);


ALTER TABLE "public"."invite_tokens" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."maintenance_completions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "maintenance_task_id" "uuid" NOT NULL,
    "completed_by" "uuid",
    "completed_by_name" character varying,
    "completed_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "completion_notes" "text",
    "checklist_results" "jsonb" DEFAULT '[]'::"jsonb",
    "photos" "jsonb" DEFAULT '[]'::"jsonb",
    "next_due_date" timestamp with time zone,
    "status" character varying DEFAULT 'completed'::character varying NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "maintenance_completions_status_check" CHECK ((("status")::"text" = ANY (ARRAY[('completed'::character varying)::"text", ('partial'::character varying)::"text", ('failed'::character varying)::"text"])))
);


ALTER TABLE "public"."maintenance_completions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."maintenance_tasks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "conservation_point_id" "uuid" NOT NULL,
    "title" character varying,
    "description" "text",
    "type" character varying NOT NULL,
    "frequency" character varying NOT NULL,
    "assigned_to" character varying NOT NULL,
    "assignment_type" character varying NOT NULL,
    "assigned_to_staff_id" "uuid",
    "assigned_to_role" character varying,
    "assigned_to_category" character varying,
    "priority" character varying DEFAULT 'medium'::character varying NOT NULL,
    "status" character varying DEFAULT 'scheduled'::character varying NOT NULL,
    "next_due" timestamp with time zone,
    "estimated_duration" integer DEFAULT 60,
    "instructions" "text"[] DEFAULT '{}'::"text"[],
    "checklist" "text"[] DEFAULT '{}'::"text"[],
    "required_tools" "text"[] DEFAULT '{}'::"text"[],
    "safety_notes" "text"[] DEFAULT '{}'::"text"[],
    "completion_notes" "text",
    "completed_by" "uuid",
    "completed_at" timestamp with time zone,
    "last_completed" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "recurrence_config" "jsonb",
    CONSTRAINT "maintenance_tasks_assignment_type_check" CHECK ((("assignment_type")::"text" = ANY (ARRAY[('role'::character varying)::"text", ('staff'::character varying)::"text", ('category'::character varying)::"text"]))),
    CONSTRAINT "maintenance_tasks_frequency_check" CHECK ((("frequency")::"text" = ANY (ARRAY[('daily'::character varying)::"text", ('weekly'::character varying)::"text", ('monthly'::character varying)::"text", ('quarterly'::character varying)::"text", ('biannually'::character varying)::"text", ('annually'::character varying)::"text", ('as_needed'::character varying)::"text", ('custom'::character varying)::"text"]))),
    CONSTRAINT "maintenance_tasks_priority_check" CHECK ((("priority")::"text" = ANY (ARRAY[('low'::character varying)::"text", ('medium'::character varying)::"text", ('high'::character varying)::"text", ('critical'::character varying)::"text"]))),
    CONSTRAINT "maintenance_tasks_status_check" CHECK ((("status")::"text" = ANY (ARRAY[('scheduled'::character varying)::"text", ('in_progress'::character varying)::"text", ('completed'::character varying)::"text", ('overdue'::character varying)::"text", ('skipped'::character varying)::"text"]))),
    CONSTRAINT "maintenance_tasks_type_check" CHECK ((("type")::"text" = ANY ((ARRAY['temperature'::character varying, 'sanitization'::character varying, 'defrosting'::character varying, 'expiry_check'::character varying])::"text"[])))
);


ALTER TABLE "public"."maintenance_tasks" OWNER TO "postgres";


COMMENT ON CONSTRAINT "maintenance_tasks_type_check" ON "public"."maintenance_tasks" IS 'Obbligatorie: temperature, sanitization, defrosting, expiry_check (Controllo Scadenze)';



CREATE TABLE IF NOT EXISTS "public"."meetings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "title" character varying NOT NULL,
    "description" "text",
    "meeting_type" character varying NOT NULL,
    "scheduled_date" timestamp with time zone NOT NULL,
    "duration_minutes" integer DEFAULT 60 NOT NULL,
    "location" character varying,
    "attendees" "jsonb" DEFAULT '[]'::"jsonb",
    "agenda" "jsonb" DEFAULT '[]'::"jsonb",
    "status" character varying DEFAULT 'scheduled'::character varying NOT NULL,
    "meeting_notes" "text",
    "action_items" "jsonb" DEFAULT '[]'::"jsonb",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "meetings_meeting_type_check" CHECK ((("meeting_type")::"text" = ANY (ARRAY[('haccp_review'::character varying)::"text", ('staff_training'::character varying)::"text", ('safety_briefing'::character varying)::"text", ('management'::character varying)::"text", ('general'::character varying)::"text"]))),
    CONSTRAINT "meetings_status_check" CHECK ((("status")::"text" = ANY (ARRAY[('scheduled'::character varying)::"text", ('in_progress'::character varying)::"text", ('completed'::character varying)::"text", ('cancelled'::character varying)::"text"])))
);


ALTER TABLE "public"."meetings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."non_conformities" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "title" character varying NOT NULL,
    "description" "text" NOT NULL,
    "severity" character varying NOT NULL,
    "status" character varying DEFAULT 'open'::character varying NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "non_conformities_severity_check" CHECK ((("severity")::"text" = ANY (ARRAY[('low'::character varying)::"text", ('medium'::character varying)::"text", ('high'::character varying)::"text", ('critical'::character varying)::"text"]))),
    CONSTRAINT "non_conformities_status_check" CHECK ((("status")::"text" = ANY (ARRAY[('open'::character varying)::"text", ('in_progress'::character varying)::"text", ('resolved'::character varying)::"text", ('closed'::character varying)::"text"])))
);


ALTER TABLE "public"."non_conformities" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "title" character varying NOT NULL,
    "content" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."notes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."product_categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "name" character varying NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."product_categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."product_expiry_completions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "product_id" "uuid" NOT NULL,
    "completed_by" "uuid",
    "completed_by_name" "text",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "action" character varying DEFAULT 'expired'::character varying NOT NULL,
    "completed_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "product_expiry_completions_action_check" CHECK ((("action")::"text" = ANY (ARRAY[('expired'::character varying)::"text", ('waste'::character varying)::"text"])))
);


ALTER TABLE "public"."product_expiry_completions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."products" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "name" character varying NOT NULL,
    "category_id" "uuid",
    "department_id" "uuid",
    "conservation_point_id" "uuid",
    "barcode" character varying,
    "sku" character varying,
    "supplier_name" character varying,
    "purchase_date" "date",
    "expiry_date" "date",
    "quantity" numeric,
    "unit" character varying,
    "allergens" "text"[] DEFAULT '{}'::"text"[],
    "label_photo_url" "text",
    "notes" "text",
    "status" character varying DEFAULT 'active'::character varying NOT NULL,
    "compliance_status" character varying,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "products_compliance_status_check" CHECK ((("compliance_status")::"text" = ANY (ARRAY[('compliant'::character varying)::"text", ('warning'::character varying)::"text", ('non_compliant'::character varying)::"text"]))),
    CONSTRAINT "products_status_check" CHECK ((("status")::"text" = ANY (ARRAY[('active'::character varying)::"text", ('expired'::character varying)::"text", ('consumed'::character varying)::"text", ('waste'::character varying)::"text"])))
);


ALTER TABLE "public"."products" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."restaurant_settings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "setting_key" character varying(100) NOT NULL,
    "setting_value" "jsonb" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."restaurant_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."shopping_list_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "shopping_list_id" "uuid" NOT NULL,
    "product_id" "uuid",
    "product_name" character varying NOT NULL,
    "category_name" character varying NOT NULL,
    "quantity" numeric DEFAULT 1 NOT NULL,
    "unit" character varying,
    "notes" "text",
    "is_completed" boolean DEFAULT false NOT NULL,
    "added_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "completed_at" timestamp with time zone,
    "is_checked" boolean DEFAULT false NOT NULL,
    "checked_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "shopping_list_items_quantity_check" CHECK (("quantity" > (0)::numeric))
);


ALTER TABLE "public"."shopping_list_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."shopping_lists" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "name" character varying NOT NULL,
    "description" "text",
    "created_by" "uuid",
    "is_template" boolean DEFAULT false NOT NULL,
    "is_completed" boolean DEFAULT false NOT NULL,
    "completed_at" timestamp with time zone,
    "status" character varying DEFAULT 'draft'::character varying,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "shopping_lists_status_check" CHECK ((("status")::"text" = ANY (ARRAY[('draft'::character varying)::"text", ('sent'::character varying)::"text", ('completed'::character varying)::"text", ('cancelled'::character varying)::"text"])))
);


ALTER TABLE "public"."shopping_lists" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."staff" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "name" character varying NOT NULL,
    "role" character varying NOT NULL,
    "category" character varying NOT NULL,
    "email" character varying,
    "phone" character varying,
    "hire_date" "date",
    "status" character varying DEFAULT 'active'::character varying NOT NULL,
    "notes" "text",
    "haccp_certification" "jsonb",
    "department_assignments" "uuid"[] DEFAULT '{}'::"uuid"[],
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "staff_role_check" CHECK ((("role")::"text" = ANY (ARRAY[('admin'::character varying)::"text", ('responsabile'::character varying)::"text", ('dipendente'::character varying)::"text", ('collaboratore'::character varying)::"text"]))),
    CONSTRAINT "staff_status_check" CHECK ((("status")::"text" = ANY (ARRAY[('active'::character varying)::"text", ('inactive'::character varying)::"text", ('suspended'::character varying)::"text"])))
);


ALTER TABLE "public"."staff" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."task_completions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "task_id" "uuid" NOT NULL,
    "completed_by" "uuid",
    "completed_by_name" "text",
    "completed_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "period_start" timestamp with time zone NOT NULL,
    "period_end" timestamp with time zone NOT NULL,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."task_completions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tasks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "name" character varying NOT NULL,
    "description" "text",
    "frequency" character varying NOT NULL,
    "assigned_to" character varying NOT NULL,
    "assignment_type" character varying NOT NULL,
    "assigned_to_staff_id" "uuid",
    "assigned_to_role" character varying,
    "assigned_to_category" character varying,
    "department_id" "uuid",
    "conservation_point_id" "uuid",
    "priority" character varying DEFAULT 'medium'::character varying NOT NULL,
    "estimated_duration" integer DEFAULT 60,
    "checklist" "text"[] DEFAULT '{}'::"text"[],
    "required_tools" "text"[] DEFAULT '{}'::"text"[],
    "haccp_category" character varying,
    "documentation_url" "text",
    "validation_notes" "text",
    "next_due" timestamp with time zone,
    "status" character varying DEFAULT 'pending'::character varying NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "time_management" "jsonb",
    "recurrence_config" "jsonb",
    CONSTRAINT "tasks_assignment_type_check" CHECK ((("assignment_type")::"text" = ANY (ARRAY[('role'::character varying)::"text", ('staff'::character varying)::"text", ('category'::character varying)::"text"]))),
    CONSTRAINT "tasks_frequency_check" CHECK ((("frequency")::"text" = ANY (ARRAY[('daily'::character varying)::"text", ('weekly'::character varying)::"text", ('monthly'::character varying)::"text", ('quarterly'::character varying)::"text", ('biannually'::character varying)::"text", ('annually'::character varying)::"text", ('annual'::character varying)::"text", ('as_needed'::character varying)::"text", ('custom'::character varying)::"text"]))),
    CONSTRAINT "tasks_priority_check" CHECK ((("priority")::"text" = ANY (ARRAY[('low'::character varying)::"text", ('medium'::character varying)::"text", ('high'::character varying)::"text", ('critical'::character varying)::"text"]))),
    CONSTRAINT "tasks_status_check" CHECK ((("status")::"text" = ANY (ARRAY[('pending'::character varying)::"text", ('in_progress'::character varying)::"text", ('completed'::character varying)::"text", ('overdue'::character varying)::"text", ('cancelled'::character varying)::"text"])))
);


ALTER TABLE "public"."tasks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."temperature_readings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "conservation_point_id" "uuid" NOT NULL,
    "temperature" numeric NOT NULL,
    "recorded_at" timestamp with time zone NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."temperature_readings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."training_sessions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "title" character varying NOT NULL,
    "description" "text",
    "training_type" character varying NOT NULL,
    "duration_minutes" integer DEFAULT 60 NOT NULL,
    "instructor" character varying,
    "location" character varying,
    "max_participants" integer,
    "scheduled_date" timestamp with time zone NOT NULL,
    "status" character varying DEFAULT 'scheduled'::character varying NOT NULL,
    "participants" "jsonb" DEFAULT '[]'::"jsonb",
    "materials" "jsonb" DEFAULT '[]'::"jsonb",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "training_sessions_status_check" CHECK ((("status")::"text" = ANY (ARRAY[('scheduled'::character varying)::"text", ('in_progress'::character varying)::"text", ('completed'::character varying)::"text", ('cancelled'::character varying)::"text"]))),
    CONSTRAINT "training_sessions_training_type_check" CHECK ((("training_type")::"text" = ANY (ARRAY[('haccp'::character varying)::"text", ('food_safety'::character varying)::"text", ('hygiene'::character varying)::"text", ('equipment'::character varying)::"text", ('general'::character varying)::"text"])))
);


ALTER TABLE "public"."training_sessions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_activity_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "company_id" "uuid" NOT NULL,
    "session_id" "uuid",
    "activity_type" character varying NOT NULL,
    "activity_data" "jsonb" DEFAULT '{}'::"jsonb",
    "entity_type" character varying,
    "entity_id" "uuid",
    "timestamp" timestamp with time zone DEFAULT "now"() NOT NULL,
    "ip_address" "inet",
    "user_agent" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "user_activity_logs_activity_type_check" CHECK ((("activity_type")::"text" = ANY (ARRAY[('session_start'::character varying)::"text", ('session_end'::character varying)::"text", ('task_completed'::character varying)::"text", ('product_added'::character varying)::"text", ('product_updated'::character varying)::"text", ('product_deleted'::character varying)::"text", ('shopping_list_created'::character varying)::"text", ('shopping_list_updated'::character varying)::"text", ('shopping_list_completed'::character varying)::"text", ('department_created'::character varying)::"text", ('staff_added'::character varying)::"text", ('conservation_point_created'::character varying)::"text", ('maintenance_task_created'::character varying)::"text", ('temperature_reading_added'::character varying)::"text", ('note_created'::character varying)::"text", ('non_conformity_reported'::character varying)::"text", ('page_view'::character varying)::"text", ('export_data'::character varying)::"text"]))),
    CONSTRAINT "user_activity_logs_entity_type_check" CHECK ((("entity_type")::"text" = ANY (ARRAY[('maintenance_task'::character varying)::"text", ('generic_task'::character varying)::"text", ('product'::character varying)::"text", ('shopping_list'::character varying)::"text", ('department'::character varying)::"text", ('staff'::character varying)::"text", ('conservation_point'::character varying)::"text", ('temperature_reading'::character varying)::"text", ('note'::character varying)::"text", ('non_conformity'::character varying)::"text"])))
);


ALTER TABLE "public"."user_activity_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_preferences" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "company_id" "uuid",
    "preference_key" character varying NOT NULL,
    "preference_value" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_preferences" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_profiles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "clerk_user_id" character varying,
    "auth_user_id" "uuid",
    "company_id" "uuid",
    "email" character varying NOT NULL,
    "first_name" character varying,
    "last_name" character varying,
    "staff_id" "uuid",
    "role" character varying DEFAULT 'guest'::character varying NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "user_profiles_role_check" CHECK ((("role")::"text" = ANY (ARRAY[('admin'::character varying)::"text", ('responsabile'::character varying)::"text", ('dipendente'::character varying)::"text", ('collaboratore'::character varying)::"text", ('guest'::character varying)::"text"])))
);


ALTER TABLE "public"."user_profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_sessions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "active_company_id" "uuid",
    "last_activity" timestamp with time zone DEFAULT "now"() NOT NULL,
    "session_start" timestamp with time zone DEFAULT "now"() NOT NULL,
    "session_end" timestamp with time zone,
    "is_active" boolean DEFAULT true NOT NULL,
    "ip_address" "inet",
    "user_agent" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."user_sessions" OWNER TO "postgres";


ALTER TABLE ONLY "public"."admin_users"
    ADD CONSTRAINT "admin_users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."admin_users"
    ADD CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."booking_requests"
    ADD CONSTRAINT "booking_requests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."companies"
    ADD CONSTRAINT "companies_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."company_calendar_settings"
    ADD CONSTRAINT "company_calendar_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."company_members"
    ADD CONSTRAINT "company_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."company_members"
    ADD CONSTRAINT "company_members_user_id_company_id_key" UNIQUE ("user_id", "company_id");



ALTER TABLE ONLY "public"."cons_point_custom_profile"
    ADD CONSTRAINT "cons_point_custom_profile_company_id_name_key" UNIQUE ("company_id", "name");



ALTER TABLE ONLY "public"."cons_point_custom_profile"
    ADD CONSTRAINT "cons_point_custom_profile_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."conservation_points"
    ADD CONSTRAINT "conservation_points_company_id_name_key" UNIQUE ("company_id", "name");



ALTER TABLE ONLY "public"."conservation_points"
    ADD CONSTRAINT "conservation_points_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."csrf_tokens"
    ADD CONSTRAINT "csrf_tokens_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."csrf_tokens"
    ADD CONSTRAINT "csrf_tokens_token_key" UNIQUE ("token");



ALTER TABLE ONLY "public"."departments"
    ADD CONSTRAINT "departments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."email_logs"
    ADD CONSTRAINT "email_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."email_schedule_logs"
    ADD CONSTRAINT "email_schedule_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."email_schedules"
    ADD CONSTRAINT "email_schedules_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."events"
    ADD CONSTRAINT "events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."haccp_configurations"
    ADD CONSTRAINT "haccp_configurations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."inventory_events"
    ADD CONSTRAINT "inventory_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."invite_tokens"
    ADD CONSTRAINT "invite_tokens_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."invite_tokens"
    ADD CONSTRAINT "invite_tokens_token_key" UNIQUE ("token");



ALTER TABLE ONLY "public"."maintenance_completions"
    ADD CONSTRAINT "maintenance_completions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."maintenance_tasks"
    ADD CONSTRAINT "maintenance_tasks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."meetings"
    ADD CONSTRAINT "meetings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."non_conformities"
    ADD CONSTRAINT "non_conformities_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notes"
    ADD CONSTRAINT "notes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_categories"
    ADD CONSTRAINT "product_categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_expiry_completions"
    ADD CONSTRAINT "product_expiry_completions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."restaurant_settings"
    ADD CONSTRAINT "restaurant_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."restaurant_settings"
    ADD CONSTRAINT "restaurant_settings_setting_key_key" UNIQUE ("setting_key");



ALTER TABLE ONLY "public"."shopping_list_items"
    ADD CONSTRAINT "shopping_list_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."shopping_lists"
    ADD CONSTRAINT "shopping_lists_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."staff"
    ADD CONSTRAINT "staff_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."task_completions"
    ADD CONSTRAINT "task_completions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tasks"
    ADD CONSTRAINT "tasks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."temperature_readings"
    ADD CONSTRAINT "temperature_readings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."training_sessions"
    ADD CONSTRAINT "training_sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."company_calendar_settings"
    ADD CONSTRAINT "unique_company_calendar_settings" UNIQUE ("company_id");



ALTER TABLE ONLY "public"."user_activity_logs"
    ADD CONSTRAINT "user_activity_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_preferences"
    ADD CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_preferences"
    ADD CONSTRAINT "user_preferences_user_id_company_id_preference_key_key" UNIQUE ("user_id", "company_id", "preference_key");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_clerk_user_id_key" UNIQUE ("clerk_user_id");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_sessions"
    ADD CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_sessions"
    ADD CONSTRAINT "user_sessions_user_id_key" UNIQUE ("user_id");



CREATE INDEX "idx_audit_logs_company_id" ON "public"."audit_logs" USING "btree" ("company_id", "created_at" DESC);



CREATE INDEX "idx_audit_logs_created_at" ON "public"."audit_logs" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_audit_logs_haccp" ON "public"."audit_logs" USING "btree" ("company_id", "table_name", "action", "created_at" DESC);



CREATE INDEX "idx_audit_logs_table_name" ON "public"."audit_logs" USING "btree" ("table_name", "record_id");



CREATE INDEX "idx_audit_logs_user_id" ON "public"."audit_logs" USING "btree" ("user_id", "created_at" DESC);



CREATE INDEX "idx_companies_name" ON "public"."companies" USING "btree" ("name");



CREATE INDEX "idx_company_members_active" ON "public"."company_members" USING "btree" ("is_active") WHERE ("is_active" = true);



CREATE INDEX "idx_company_members_company_id" ON "public"."company_members" USING "btree" ("company_id");



CREATE INDEX "idx_company_members_lookup" ON "public"."company_members" USING "btree" ("user_id", "company_id", "is_active");



CREATE INDEX "idx_company_members_user_id" ON "public"."company_members" USING "btree" ("user_id");



CREATE INDEX "idx_conservation_points_company_id" ON "public"."conservation_points" USING "btree" ("company_id");



CREATE INDEX "idx_conservation_points_department_id" ON "public"."conservation_points" USING "btree" ("department_id");



CREATE INDEX "idx_conservation_points_profile" ON "public"."conservation_points" USING "btree" ("profile_id") WHERE ("profile_id" IS NOT NULL);



CREATE INDEX "idx_conservation_points_status" ON "public"."conservation_points" USING "btree" ("company_id", "status");



CREATE INDEX "idx_csrf_tokens_created_at" ON "public"."csrf_tokens" USING "btree" ("created_at");



CREATE INDEX "idx_csrf_tokens_expires_at" ON "public"."csrf_tokens" USING "btree" ("expires_at");



CREATE INDEX "idx_csrf_tokens_token" ON "public"."csrf_tokens" USING "btree" ("token");



CREATE INDEX "idx_csrf_tokens_user_id" ON "public"."csrf_tokens" USING "btree" ("user_id");



CREATE INDEX "idx_custom_profiles_category" ON "public"."cons_point_custom_profile" USING "btree" ("appliance_category");



CREATE INDEX "idx_custom_profiles_company_id" ON "public"."cons_point_custom_profile" USING "btree" ("company_id");



CREATE INDEX "idx_departments_active" ON "public"."departments" USING "btree" ("company_id", "is_active");



CREATE INDEX "idx_departments_company_id" ON "public"."departments" USING "btree" ("company_id");



CREATE INDEX "idx_email_schedule_logs_company_id" ON "public"."email_schedule_logs" USING "btree" ("company_id");



CREATE INDEX "idx_email_schedule_logs_schedule_id" ON "public"."email_schedule_logs" USING "btree" ("email_schedule_id");



CREATE INDEX "idx_email_schedule_logs_sent_at" ON "public"."email_schedule_logs" USING "btree" ("sent_at");



CREATE INDEX "idx_email_schedules_active" ON "public"."email_schedules" USING "btree" ("is_active");



CREATE INDEX "idx_email_schedules_company_id" ON "public"."email_schedules" USING "btree" ("company_id");



CREATE INDEX "idx_email_schedules_next_scheduled" ON "public"."email_schedules" USING "btree" ("next_scheduled");



CREATE INDEX "idx_events_company_id" ON "public"."events" USING "btree" ("company_id");



CREATE INDEX "idx_events_start_date" ON "public"."events" USING "btree" ("start_date" DESC);



CREATE INDEX "idx_haccp_configurations_active" ON "public"."haccp_configurations" USING "btree" ("is_active");



CREATE INDEX "idx_haccp_configurations_company_id" ON "public"."haccp_configurations" USING "btree" ("company_id");



CREATE INDEX "idx_haccp_configurations_type" ON "public"."haccp_configurations" USING "btree" ("configuration_type");



CREATE INDEX "idx_inventory_events_company_id" ON "public"."inventory_events" USING "btree" ("company_id");



CREATE INDEX "idx_inventory_events_event_date" ON "public"."inventory_events" USING "btree" ("event_date");



CREATE INDEX "idx_inventory_events_event_type" ON "public"."inventory_events" USING "btree" ("event_type");



CREATE INDEX "idx_inventory_events_product_id" ON "public"."inventory_events" USING "btree" ("product_id");



CREATE INDEX "idx_invite_tokens_company" ON "public"."invite_tokens" USING "btree" ("company_id");



CREATE INDEX "idx_invite_tokens_email" ON "public"."invite_tokens" USING "btree" ("email");



CREATE INDEX "idx_invite_tokens_expired" ON "public"."invite_tokens" USING "btree" ("expires_at") WHERE ("used_at" IS NULL);



CREATE INDEX "idx_invite_tokens_token" ON "public"."invite_tokens" USING "btree" ("token");



CREATE INDEX "idx_maintenance_completions_company_id" ON "public"."maintenance_completions" USING "btree" ("company_id");



CREATE INDEX "idx_maintenance_completions_completed_at" ON "public"."maintenance_completions" USING "btree" ("completed_at");



CREATE INDEX "idx_maintenance_completions_next_due" ON "public"."maintenance_completions" USING "btree" ("next_due_date");



CREATE INDEX "idx_maintenance_completions_task_id" ON "public"."maintenance_completions" USING "btree" ("maintenance_task_id");



CREATE INDEX "idx_maintenance_tasks_company_id" ON "public"."maintenance_tasks" USING "btree" ("company_id");



CREATE INDEX "idx_maintenance_tasks_next_due" ON "public"."maintenance_tasks" USING "btree" ("next_due");



CREATE INDEX "idx_maintenance_tasks_point_id" ON "public"."maintenance_tasks" USING "btree" ("conservation_point_id");



CREATE INDEX "idx_maintenance_tasks_recurrence_config" ON "public"."maintenance_tasks" USING "gin" ("recurrence_config");



CREATE INDEX "idx_maintenance_tasks_staff_id" ON "public"."maintenance_tasks" USING "btree" ("assigned_to_staff_id");



CREATE INDEX "idx_maintenance_tasks_status" ON "public"."maintenance_tasks" USING "btree" ("company_id", "status");



CREATE INDEX "idx_meetings_company_id" ON "public"."meetings" USING "btree" ("company_id");



CREATE INDEX "idx_meetings_scheduled_date" ON "public"."meetings" USING "btree" ("scheduled_date");



CREATE INDEX "idx_meetings_status" ON "public"."meetings" USING "btree" ("status");



CREATE INDEX "idx_non_conformities_company_id" ON "public"."non_conformities" USING "btree" ("company_id");



CREATE INDEX "idx_non_conformities_severity" ON "public"."non_conformities" USING "btree" ("company_id", "severity");



CREATE INDEX "idx_non_conformities_status" ON "public"."non_conformities" USING "btree" ("company_id", "status");



CREATE INDEX "idx_notes_company_id" ON "public"."notes" USING "btree" ("company_id");



CREATE INDEX "idx_notes_created_at" ON "public"."notes" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_product_categories_company_id" ON "public"."product_categories" USING "btree" ("company_id");



CREATE INDEX "idx_product_expiry_completions_company_id" ON "public"."product_expiry_completions" USING "btree" ("company_id");



CREATE INDEX "idx_product_expiry_completions_product_id" ON "public"."product_expiry_completions" USING "btree" ("product_id");



CREATE INDEX "idx_products_barcode" ON "public"."products" USING "btree" ("barcode");



CREATE INDEX "idx_products_category_id" ON "public"."products" USING "btree" ("category_id");



CREATE INDEX "idx_products_company_id" ON "public"."products" USING "btree" ("company_id");



CREATE INDEX "idx_products_conservation_point_id" ON "public"."products" USING "btree" ("conservation_point_id");



CREATE INDEX "idx_products_department_id" ON "public"."products" USING "btree" ("department_id");



CREATE INDEX "idx_products_expiry_date" ON "public"."products" USING "btree" ("expiry_date");



CREATE INDEX "idx_products_status" ON "public"."products" USING "btree" ("company_id", "status");



CREATE INDEX "idx_shopping_list_items_checked" ON "public"."shopping_list_items" USING "btree" ("shopping_list_id", "is_checked");



CREATE INDEX "idx_shopping_list_items_list_id" ON "public"."shopping_list_items" USING "btree" ("shopping_list_id");



CREATE INDEX "idx_shopping_list_items_product_id" ON "public"."shopping_list_items" USING "btree" ("product_id");



CREATE INDEX "idx_shopping_lists_company_id" ON "public"."shopping_lists" USING "btree" ("company_id");



CREATE INDEX "idx_shopping_lists_created_by" ON "public"."shopping_lists" USING "btree" ("created_by");



CREATE INDEX "idx_shopping_lists_is_template" ON "public"."shopping_lists" USING "btree" ("is_template");



CREATE INDEX "idx_shopping_lists_status" ON "public"."shopping_lists" USING "btree" ("company_id", "status");



CREATE INDEX "idx_staff_company_id" ON "public"."staff" USING "btree" ("company_id");



CREATE INDEX "idx_staff_email" ON "public"."staff" USING "btree" ("email");



CREATE INDEX "idx_staff_role" ON "public"."staff" USING "btree" ("company_id", "role");



CREATE INDEX "idx_staff_status" ON "public"."staff" USING "btree" ("company_id", "status");



CREATE INDEX "idx_task_completions_company_id" ON "public"."task_completions" USING "btree" ("company_id");



CREATE INDEX "idx_task_completions_completed_at" ON "public"."task_completions" USING "btree" ("completed_at" DESC);



CREATE INDEX "idx_task_completions_completed_by" ON "public"."task_completions" USING "btree" ("completed_by");



CREATE INDEX "idx_task_completions_lookup" ON "public"."task_completions" USING "btree" ("company_id", "task_id", "completed_at" DESC);



CREATE INDEX "idx_task_completions_period" ON "public"."task_completions" USING "btree" ("task_id", "period_start", "period_end");



CREATE INDEX "idx_task_completions_task_id" ON "public"."task_completions" USING "btree" ("task_id");



CREATE INDEX "idx_tasks_company_id" ON "public"."tasks" USING "btree" ("company_id");



CREATE INDEX "idx_tasks_conservation_point_id" ON "public"."tasks" USING "btree" ("conservation_point_id");



CREATE INDEX "idx_tasks_department_id" ON "public"."tasks" USING "btree" ("department_id");



CREATE INDEX "idx_tasks_next_due" ON "public"."tasks" USING "btree" ("next_due");



CREATE INDEX "idx_tasks_recurrence_config" ON "public"."tasks" USING "gin" ("recurrence_config");



CREATE INDEX "idx_tasks_staff_id" ON "public"."tasks" USING "btree" ("assigned_to_staff_id");



CREATE INDEX "idx_tasks_status" ON "public"."tasks" USING "btree" ("company_id", "status");



CREATE INDEX "idx_temperature_readings_company_id" ON "public"."temperature_readings" USING "btree" ("company_id");



CREATE INDEX "idx_temperature_readings_lookup" ON "public"."temperature_readings" USING "btree" ("conservation_point_id", "recorded_at" DESC);



CREATE INDEX "idx_temperature_readings_point_id" ON "public"."temperature_readings" USING "btree" ("conservation_point_id");



CREATE INDEX "idx_temperature_readings_recorded_at" ON "public"."temperature_readings" USING "btree" ("recorded_at" DESC);



CREATE INDEX "idx_training_sessions_company_id" ON "public"."training_sessions" USING "btree" ("company_id");



CREATE INDEX "idx_training_sessions_scheduled_date" ON "public"."training_sessions" USING "btree" ("scheduled_date");



CREATE INDEX "idx_training_sessions_status" ON "public"."training_sessions" USING "btree" ("status");



CREATE INDEX "idx_user_activity_logs_activity_type" ON "public"."user_activity_logs" USING "btree" ("company_id", "activity_type", "created_at" DESC);



CREATE INDEX "idx_user_activity_logs_company_id" ON "public"."user_activity_logs" USING "btree" ("company_id", "created_at" DESC);



CREATE INDEX "idx_user_activity_logs_entity" ON "public"."user_activity_logs" USING "btree" ("entity_type", "entity_id");



CREATE INDEX "idx_user_activity_logs_session_id" ON "public"."user_activity_logs" USING "btree" ("session_id");



CREATE INDEX "idx_user_activity_logs_user_id" ON "public"."user_activity_logs" USING "btree" ("user_id", "created_at" DESC);



CREATE INDEX "idx_user_preferences_company_id" ON "public"."user_preferences" USING "btree" ("company_id");



CREATE INDEX "idx_user_preferences_key" ON "public"."user_preferences" USING "btree" ("preference_key");



CREATE INDEX "idx_user_preferences_user_id" ON "public"."user_preferences" USING "btree" ("user_id");



CREATE INDEX "idx_user_sessions_active" ON "public"."user_sessions" USING "btree" ("user_id", "active_company_id");



CREATE INDEX "idx_user_sessions_company_id" ON "public"."user_sessions" USING "btree" ("active_company_id");



CREATE INDEX "idx_user_sessions_user_id" ON "public"."user_sessions" USING "btree" ("user_id");



CREATE OR REPLACE TRIGGER "trigger_update_task_on_completion" AFTER INSERT ON "public"."maintenance_completions" FOR EACH ROW EXECUTE FUNCTION "public"."update_maintenance_task_on_completion"();



COMMENT ON TRIGGER "trigger_update_task_on_completion" ON "public"."maintenance_completions" IS 'Aggiorna automaticamente i task ricorrenti quando vengono completati';



CREATE OR REPLACE TRIGGER "update_companies_updated_at" BEFORE UPDATE ON "public"."companies" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_company_calendar_settings_updated_at" BEFORE UPDATE ON "public"."company_calendar_settings" FOR EACH ROW EXECUTE FUNCTION "public"."update_company_calendar_settings_updated_at"();



CREATE OR REPLACE TRIGGER "update_company_members_updated_at" BEFORE UPDATE ON "public"."company_members" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_conservation_points_updated_at" BEFORE UPDATE ON "public"."conservation_points" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_custom_profiles_updated_at" BEFORE UPDATE ON "public"."cons_point_custom_profile" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_departments_updated_at" BEFORE UPDATE ON "public"."departments" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_events_updated_at" BEFORE UPDATE ON "public"."events" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_maintenance_tasks_updated_at" BEFORE UPDATE ON "public"."maintenance_tasks" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_non_conformities_updated_at" BEFORE UPDATE ON "public"."non_conformities" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_notes_updated_at" BEFORE UPDATE ON "public"."notes" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_product_categories_updated_at" BEFORE UPDATE ON "public"."product_categories" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_products_updated_at" BEFORE UPDATE ON "public"."products" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_shopping_list_items_updated_at" BEFORE UPDATE ON "public"."shopping_list_items" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_shopping_lists_updated_at" BEFORE UPDATE ON "public"."shopping_lists" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_staff_updated_at" BEFORE UPDATE ON "public"."staff" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_task_completions_updated_at" BEFORE UPDATE ON "public"."task_completions" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_tasks_updated_at" BEFORE UPDATE ON "public"."tasks" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_user_profiles_updated_at" BEFORE UPDATE ON "public"."user_profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_user_sessions_updated_at" BEFORE UPDATE ON "public"."user_sessions" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."company_calendar_settings"
    ADD CONSTRAINT "company_calendar_settings_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."company_members"
    ADD CONSTRAINT "company_members_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."company_members"
    ADD CONSTRAINT "company_members_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "public"."staff"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."company_members"
    ADD CONSTRAINT "company_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."cons_point_custom_profile"
    ADD CONSTRAINT "cons_point_custom_profile_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."conservation_points"
    ADD CONSTRAINT "conservation_points_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."conservation_points"
    ADD CONSTRAINT "conservation_points_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."csrf_tokens"
    ADD CONSTRAINT "csrf_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."departments"
    ADD CONSTRAINT "departments_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."email_logs"
    ADD CONSTRAINT "email_logs_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "public"."booking_requests"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."email_schedule_logs"
    ADD CONSTRAINT "email_schedule_logs_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."email_schedule_logs"
    ADD CONSTRAINT "email_schedule_logs_email_schedule_id_fkey" FOREIGN KEY ("email_schedule_id") REFERENCES "public"."email_schedules"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."email_schedules"
    ADD CONSTRAINT "email_schedules_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."email_schedules"
    ADD CONSTRAINT "email_schedules_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."events"
    ADD CONSTRAINT "events_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."haccp_configurations"
    ADD CONSTRAINT "haccp_configurations_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."haccp_configurations"
    ADD CONSTRAINT "haccp_configurations_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."inventory_events"
    ADD CONSTRAINT "inventory_events_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."inventory_events"
    ADD CONSTRAINT "inventory_events_performed_by_fkey" FOREIGN KEY ("performed_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."inventory_events"
    ADD CONSTRAINT "inventory_events_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."invite_tokens"
    ADD CONSTRAINT "invite_tokens_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."invite_tokens"
    ADD CONSTRAINT "invite_tokens_invited_by_fkey" FOREIGN KEY ("invited_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."invite_tokens"
    ADD CONSTRAINT "invite_tokens_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "public"."staff"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."maintenance_completions"
    ADD CONSTRAINT "maintenance_completions_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."maintenance_completions"
    ADD CONSTRAINT "maintenance_completions_completed_by_fkey" FOREIGN KEY ("completed_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."maintenance_completions"
    ADD CONSTRAINT "maintenance_completions_maintenance_task_id_fkey" FOREIGN KEY ("maintenance_task_id") REFERENCES "public"."maintenance_tasks"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."maintenance_tasks"
    ADD CONSTRAINT "maintenance_tasks_assigned_to_staff_id_fkey" FOREIGN KEY ("assigned_to_staff_id") REFERENCES "public"."staff"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."maintenance_tasks"
    ADD CONSTRAINT "maintenance_tasks_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."maintenance_tasks"
    ADD CONSTRAINT "maintenance_tasks_conservation_point_id_fkey" FOREIGN KEY ("conservation_point_id") REFERENCES "public"."conservation_points"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."meetings"
    ADD CONSTRAINT "meetings_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."meetings"
    ADD CONSTRAINT "meetings_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."non_conformities"
    ADD CONSTRAINT "non_conformities_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notes"
    ADD CONSTRAINT "notes_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_categories"
    ADD CONSTRAINT "product_categories_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_expiry_completions"
    ADD CONSTRAINT "product_expiry_completions_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_expiry_completions"
    ADD CONSTRAINT "product_expiry_completions_completed_by_fkey" FOREIGN KEY ("completed_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."product_expiry_completions"
    ADD CONSTRAINT "product_expiry_completions_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."product_categories"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_conservation_point_id_fkey" FOREIGN KEY ("conservation_point_id") REFERENCES "public"."conservation_points"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."shopping_list_items"
    ADD CONSTRAINT "shopping_list_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."shopping_list_items"
    ADD CONSTRAINT "shopping_list_items_shopping_list_id_fkey" FOREIGN KEY ("shopping_list_id") REFERENCES "public"."shopping_lists"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."shopping_lists"
    ADD CONSTRAINT "shopping_lists_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."shopping_lists"
    ADD CONSTRAINT "shopping_lists_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."staff"
    ADD CONSTRAINT "staff_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."task_completions"
    ADD CONSTRAINT "task_completions_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."task_completions"
    ADD CONSTRAINT "task_completions_completed_by_fkey" FOREIGN KEY ("completed_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."task_completions"
    ADD CONSTRAINT "task_completions_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."tasks"
    ADD CONSTRAINT "tasks_assigned_to_staff_id_fkey" FOREIGN KEY ("assigned_to_staff_id") REFERENCES "public"."staff"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."tasks"
    ADD CONSTRAINT "tasks_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."tasks"
    ADD CONSTRAINT "tasks_conservation_point_id_fkey" FOREIGN KEY ("conservation_point_id") REFERENCES "public"."conservation_points"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."tasks"
    ADD CONSTRAINT "tasks_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."temperature_readings"
    ADD CONSTRAINT "temperature_readings_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."temperature_readings"
    ADD CONSTRAINT "temperature_readings_conservation_point_id_fkey" FOREIGN KEY ("conservation_point_id") REFERENCES "public"."conservation_points"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."training_sessions"
    ADD CONSTRAINT "training_sessions_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."training_sessions"
    ADD CONSTRAINT "training_sessions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."user_activity_logs"
    ADD CONSTRAINT "user_activity_logs_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_activity_logs"
    ADD CONSTRAINT "user_activity_logs_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."user_sessions"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."user_activity_logs"
    ADD CONSTRAINT "user_activity_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_preferences"
    ADD CONSTRAINT "user_preferences_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_preferences"
    ADD CONSTRAINT "user_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_auth_user_id_fkey" FOREIGN KEY ("auth_user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "public"."staff"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."user_sessions"
    ADD CONSTRAINT "user_sessions_active_company_id_fkey" FOREIGN KEY ("active_company_id") REFERENCES "public"."companies"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."user_sessions"
    ADD CONSTRAINT "user_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Admins can create invites" ON "public"."invite_tokens" FOR INSERT WITH CHECK ("public"."is_admin"("company_id"));



CREATE POLICY "Admins can create memberships" ON "public"."company_members" FOR INSERT WITH CHECK ("public"."is_admin"("company_id"));



CREATE POLICY "Admins can delete invites" ON "public"."invite_tokens" FOR DELETE USING ("public"."is_admin"("company_id"));



CREATE POLICY "Admins can delete memberships" ON "public"."company_members" FOR DELETE USING ("public"."is_admin"("company_id"));



CREATE POLICY "Admins can update company info" ON "public"."companies" FOR UPDATE USING ("public"."is_admin"("id")) WITH CHECK ("public"."is_admin"("id"));



CREATE POLICY "Admins can update memberships" ON "public"."company_members" FOR UPDATE USING ("public"."is_admin"("company_id")) WITH CHECK ("public"."is_admin"("company_id"));



CREATE POLICY "Admins can view audit logs" ON "public"."audit_logs" FOR SELECT USING ("public"."is_admin"("company_id"));



CREATE POLICY "Admins can view company invites" ON "public"."invite_tokens" FOR SELECT USING ("public"."is_admin"("company_id"));



CREATE POLICY "Admins can view company profiles" ON "public"."user_profiles" FOR SELECT USING ((("company_id" IS NOT NULL) AND "public"."is_admin"("company_id")));



CREATE POLICY "Allow company insert during onboarding" ON "public"."companies" FOR INSERT WITH CHECK (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Allow company select during onboarding" ON "public"."companies" FOR SELECT USING ((("id" IN ( SELECT "company_members"."company_id"
   FROM "public"."company_members"
  WHERE (("company_members"."user_id" = "auth"."uid"()) AND ("company_members"."is_active" = true)))) OR (NOT (EXISTS ( SELECT 1
   FROM "public"."company_members"
  WHERE (("company_members"."user_id" = "auth"."uid"()) AND ("company_members"."is_active" = true)))))));



CREATE POLICY "Allow insert during signup" ON "public"."company_members" FOR INSERT WITH CHECK (true);



CREATE POLICY "Allow insert during signup" ON "public"."user_profiles" FOR INSERT WITH CHECK (true);



CREATE POLICY "Allow insert during signup" ON "public"."user_sessions" FOR INSERT WITH CHECK (true);



CREATE POLICY "Allow read for token validation" ON "public"."invite_tokens" FOR SELECT USING (true);



CREATE POLICY "Allow update for acceptance" ON "public"."invite_tokens" FOR UPDATE USING (true) WITH CHECK (true);



CREATE POLICY "Anyone can view own invite" ON "public"."invite_tokens" FOR SELECT USING ((("email")::"text" = (( SELECT "users"."email"
   FROM "auth"."users"
  WHERE ("users"."id" = "auth"."uid"())))::"text"));



CREATE POLICY "Managers can create categories" ON "public"."product_categories" FOR INSERT WITH CHECK ("public"."has_management_role"("company_id"));



CREATE POLICY "Managers can create conservation points" ON "public"."conservation_points" FOR INSERT WITH CHECK ("public"."has_management_role"("company_id"));



CREATE POLICY "Managers can create departments" ON "public"."departments" FOR INSERT WITH CHECK ("public"."has_management_role"("company_id"));



CREATE POLICY "Managers can create events" ON "public"."events" FOR INSERT WITH CHECK ("public"."has_management_role"("company_id"));



CREATE POLICY "Managers can create maintenance tasks" ON "public"."maintenance_tasks" FOR INSERT WITH CHECK ("public"."has_management_role"("company_id"));



CREATE POLICY "Managers can create products" ON "public"."products" FOR INSERT WITH CHECK ("public"."has_management_role"("company_id"));



CREATE POLICY "Managers can create staff" ON "public"."staff" FOR INSERT WITH CHECK ("public"."has_management_role"("company_id"));



CREATE POLICY "Managers can create tasks" ON "public"."tasks" FOR INSERT WITH CHECK ("public"."has_management_role"("company_id"));



CREATE POLICY "Managers can delete categories" ON "public"."product_categories" FOR DELETE USING ("public"."has_management_role"("company_id"));



CREATE POLICY "Managers can delete conservation points" ON "public"."conservation_points" FOR DELETE USING ("public"."has_management_role"("company_id"));



CREATE POLICY "Managers can delete departments" ON "public"."departments" FOR DELETE USING ("public"."has_management_role"("company_id"));



CREATE POLICY "Managers can delete events" ON "public"."events" FOR DELETE USING ("public"."has_management_role"("company_id"));



CREATE POLICY "Managers can delete maintenance tasks" ON "public"."maintenance_tasks" FOR DELETE USING ("public"."has_management_role"("company_id"));



CREATE POLICY "Managers can delete non-conformities" ON "public"."non_conformities" FOR DELETE USING ("public"."has_management_role"("company_id"));



CREATE POLICY "Managers can delete notes" ON "public"."notes" FOR DELETE USING ("public"."has_management_role"("company_id"));



CREATE POLICY "Managers can delete products" ON "public"."products" FOR DELETE USING ("public"."has_management_role"("company_id"));



CREATE POLICY "Managers can delete staff" ON "public"."staff" FOR DELETE USING ("public"."has_management_role"("company_id"));



CREATE POLICY "Managers can delete tasks" ON "public"."tasks" FOR DELETE USING ("public"."has_management_role"("company_id"));



CREATE POLICY "Managers can delete temperature readings" ON "public"."temperature_readings" FOR DELETE USING ("public"."has_management_role"("company_id"));



CREATE POLICY "Managers can manage custom profiles" ON "public"."cons_point_custom_profile" USING ("public"."has_management_role"("company_id")) WITH CHECK ("public"."has_management_role"("company_id"));



CREATE POLICY "Managers can update categories" ON "public"."product_categories" FOR UPDATE USING ("public"."has_management_role"("company_id")) WITH CHECK ("public"."has_management_role"("company_id"));



CREATE POLICY "Managers can update conservation points" ON "public"."conservation_points" FOR UPDATE USING ("public"."has_management_role"("company_id")) WITH CHECK ("public"."has_management_role"("company_id"));



CREATE POLICY "Managers can update departments" ON "public"."departments" FOR UPDATE USING ("public"."has_management_role"("company_id")) WITH CHECK ("public"."has_management_role"("company_id"));



CREATE POLICY "Managers can update events" ON "public"."events" FOR UPDATE USING ("public"."has_management_role"("company_id")) WITH CHECK ("public"."has_management_role"("company_id"));



CREATE POLICY "Managers can update maintenance tasks" ON "public"."maintenance_tasks" FOR UPDATE USING ("public"."has_management_role"("company_id")) WITH CHECK ("public"."has_management_role"("company_id"));



CREATE POLICY "Managers can update non-conformities" ON "public"."non_conformities" FOR UPDATE USING ("public"."has_management_role"("company_id")) WITH CHECK ("public"."has_management_role"("company_id"));



CREATE POLICY "Managers can update notes" ON "public"."notes" FOR UPDATE USING ("public"."has_management_role"("company_id")) WITH CHECK ("public"."has_management_role"("company_id"));



CREATE POLICY "Managers can update products" ON "public"."products" FOR UPDATE USING ("public"."has_management_role"("company_id")) WITH CHECK ("public"."has_management_role"("company_id"));



CREATE POLICY "Managers can update staff" ON "public"."staff" FOR UPDATE USING ("public"."has_management_role"("company_id")) WITH CHECK ("public"."has_management_role"("company_id"));



CREATE POLICY "Managers can update tasks" ON "public"."tasks" FOR UPDATE USING ("public"."has_management_role"("company_id")) WITH CHECK ("public"."has_management_role"("company_id"));



CREATE POLICY "Managers can update temperature readings" ON "public"."temperature_readings" FOR UPDATE USING ("public"."has_management_role"("company_id")) WITH CHECK ("public"."has_management_role"("company_id"));



CREATE POLICY "Members can create non-conformities" ON "public"."non_conformities" FOR INSERT WITH CHECK ("public"."is_company_member"("company_id"));



CREATE POLICY "Members can create notes" ON "public"."notes" FOR INSERT WITH CHECK ("public"."is_company_member"("company_id"));



CREATE POLICY "Members can create shopping list items" ON "public"."shopping_list_items" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."shopping_lists" "sl"
  WHERE (("sl"."id" = "shopping_list_items"."shopping_list_id") AND "public"."is_company_member"("sl"."company_id")))));



CREATE POLICY "Members can create shopping lists" ON "public"."shopping_lists" FOR INSERT WITH CHECK ("public"."is_company_member"("company_id"));



CREATE POLICY "Members can create temperature readings" ON "public"."temperature_readings" FOR INSERT WITH CHECK ("public"."is_company_member"("company_id"));



CREATE POLICY "Members can delete shopping list items" ON "public"."shopping_list_items" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."shopping_lists" "sl"
  WHERE (("sl"."id" = "shopping_list_items"."shopping_list_id") AND "public"."is_company_member"("sl"."company_id")))));



CREATE POLICY "Members can delete shopping lists" ON "public"."shopping_lists" FOR DELETE USING ("public"."is_company_member"("company_id"));



CREATE POLICY "Members can update shopping list items" ON "public"."shopping_list_items" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."shopping_lists" "sl"
  WHERE (("sl"."id" = "shopping_list_items"."shopping_list_id") AND "public"."is_company_member"("sl"."company_id"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."shopping_lists" "sl"
  WHERE (("sl"."id" = "shopping_list_items"."shopping_list_id") AND "public"."is_company_member"("sl"."company_id")))));



CREATE POLICY "Members can update shopping lists" ON "public"."shopping_lists" FOR UPDATE USING ("public"."is_company_member"("company_id")) WITH CHECK ("public"."is_company_member"("company_id"));



CREATE POLICY "Members can view categories" ON "public"."product_categories" FOR SELECT USING ("public"."is_company_member"("company_id"));



CREATE POLICY "Members can view conservation points" ON "public"."conservation_points" FOR SELECT USING ("public"."is_company_member"("company_id"));



CREATE POLICY "Members can view custom profiles" ON "public"."cons_point_custom_profile" FOR SELECT USING ("public"."is_company_member"("company_id"));



CREATE POLICY "Members can view departments" ON "public"."departments" FOR SELECT USING ("public"."is_company_member"("company_id"));



CREATE POLICY "Members can view events" ON "public"."events" FOR SELECT USING ("public"."is_company_member"("company_id"));



CREATE POLICY "Members can view maintenance tasks" ON "public"."maintenance_tasks" FOR SELECT USING ("public"."is_company_member"("company_id"));



CREATE POLICY "Members can view non-conformities" ON "public"."non_conformities" FOR SELECT USING ("public"."is_company_member"("company_id"));



CREATE POLICY "Members can view notes" ON "public"."notes" FOR SELECT USING ("public"."is_company_member"("company_id"));



CREATE POLICY "Members can view products" ON "public"."products" FOR SELECT USING ("public"."is_company_member"("company_id"));



CREATE POLICY "Members can view shopping list items" ON "public"."shopping_list_items" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."shopping_lists" "sl"
  WHERE (("sl"."id" = "shopping_list_items"."shopping_list_id") AND "public"."is_company_member"("sl"."company_id")))));



CREATE POLICY "Members can view shopping lists" ON "public"."shopping_lists" FOR SELECT USING ("public"."is_company_member"("company_id"));



CREATE POLICY "Members can view staff" ON "public"."staff" FOR SELECT USING ("public"."is_company_member"("company_id"));



CREATE POLICY "Members can view tasks" ON "public"."tasks" FOR SELECT USING ("public"."is_company_member"("company_id"));



CREATE POLICY "Members can view temperature readings" ON "public"."temperature_readings" FOR SELECT USING ("public"."is_company_member"("company_id"));



CREATE POLICY "System can insert audit logs" ON "public"."audit_logs" FOR INSERT WITH CHECK ("public"."is_company_member"("company_id"));



CREATE POLICY "System can update used invites" ON "public"."invite_tokens" FOR UPDATE USING ((("email")::"text" = (( SELECT "users"."email"
   FROM "auth"."users"
  WHERE ("users"."id" = "auth"."uid"())))::"text")) WITH CHECK (("used_at" IS NOT NULL));



CREATE POLICY "Users can delete HACCP configurations for their company" ON "public"."haccp_configurations" FOR DELETE USING (("company_id" IN ( SELECT "company_members"."company_id"
   FROM "public"."company_members"
  WHERE (("company_members"."user_id" = "auth"."uid"()) AND ("company_members"."is_active" = true)))));



CREATE POLICY "Users can delete email schedules for their company" ON "public"."email_schedules" FOR DELETE USING (("company_id" IN ( SELECT "company_members"."company_id"
   FROM "public"."company_members"
  WHERE (("company_members"."user_id" = "auth"."uid"()) AND ("company_members"."is_active" = true)))));



CREATE POLICY "Users can delete inventory events for their company" ON "public"."inventory_events" FOR DELETE USING (("company_id" IN ( SELECT "company_members"."company_id"
   FROM "public"."company_members"
  WHERE (("company_members"."user_id" = "auth"."uid"()) AND ("company_members"."is_active" = true)))));



CREATE POLICY "Users can delete maintenance completions for their company" ON "public"."maintenance_completions" FOR DELETE USING (("company_id" IN ( SELECT "company_members"."company_id"
   FROM "public"."company_members"
  WHERE (("company_members"."user_id" = "auth"."uid"()) AND ("company_members"."is_active" = true)))));



CREATE POLICY "Users can delete meetings for their company" ON "public"."meetings" FOR DELETE USING (("company_id" IN ( SELECT "company_members"."company_id"
   FROM "public"."company_members"
  WHERE (("company_members"."user_id" = "auth"."uid"()) AND ("company_members"."is_active" = true)))));



CREATE POLICY "Users can delete product expiry completions for their company" ON "public"."product_expiry_completions" FOR DELETE USING (("company_id" IN ( SELECT "company_members"."company_id"
   FROM "public"."company_members"
  WHERE (("company_members"."user_id" = "auth"."uid"()) AND ("company_members"."is_active" = true)))));



CREATE POLICY "Users can delete their own preferences" ON "public"."user_preferences" FOR DELETE USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can delete training sessions for their company" ON "public"."training_sessions" FOR DELETE USING (("company_id" IN ( SELECT "company_members"."company_id"
   FROM "public"."company_members"
  WHERE (("company_members"."user_id" = "auth"."uid"()) AND ("company_members"."is_active" = true)))));



CREATE POLICY "Users can insert HACCP configurations for their company" ON "public"."haccp_configurations" FOR INSERT WITH CHECK (("company_id" IN ( SELECT "company_members"."company_id"
   FROM "public"."company_members"
  WHERE (("company_members"."user_id" = "auth"."uid"()) AND ("company_members"."is_active" = true)))));



CREATE POLICY "Users can insert calendar settings for their company" ON "public"."company_calendar_settings" FOR INSERT WITH CHECK (("company_id" IN ( SELECT "company_members"."company_id"
   FROM "public"."company_members"
  WHERE (("company_members"."user_id" = "auth"."uid"()) AND ("company_members"."is_active" = true)))));



CREATE POLICY "Users can insert email schedules for their company" ON "public"."email_schedules" FOR INSERT WITH CHECK (("company_id" IN ( SELECT "company_members"."company_id"
   FROM "public"."company_members"
  WHERE (("company_members"."user_id" = "auth"."uid"()) AND ("company_members"."is_active" = true)))));



CREATE POLICY "Users can insert inventory events for their company" ON "public"."inventory_events" FOR INSERT WITH CHECK (("company_id" IN ( SELECT "company_members"."company_id"
   FROM "public"."company_members"
  WHERE (("company_members"."user_id" = "auth"."uid"()) AND ("company_members"."is_active" = true)))));



CREATE POLICY "Users can insert maintenance completions for their company" ON "public"."maintenance_completions" FOR INSERT WITH CHECK (("company_id" IN ( SELECT "company_members"."company_id"
   FROM "public"."company_members"
  WHERE (("company_members"."user_id" = "auth"."uid"()) AND ("company_members"."is_active" = true)))));



CREATE POLICY "Users can insert meetings for their company" ON "public"."meetings" FOR INSERT WITH CHECK (("company_id" IN ( SELECT "company_members"."company_id"
   FROM "public"."company_members"
  WHERE (("company_members"."user_id" = "auth"."uid"()) AND ("company_members"."is_active" = true)))));



CREATE POLICY "Users can insert product expiry completions for their company" ON "public"."product_expiry_completions" FOR INSERT WITH CHECK (("company_id" IN ( SELECT "company_members"."company_id"
   FROM "public"."company_members"
  WHERE (("company_members"."user_id" = "auth"."uid"()) AND ("company_members"."is_active" = true)))));



CREATE POLICY "Users can insert their own preferences" ON "public"."user_preferences" FOR INSERT WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can insert training sessions for their company" ON "public"."training_sessions" FOR INSERT WITH CHECK (("company_id" IN ( SELECT "company_members"."company_id"
   FROM "public"."company_members"
  WHERE (("company_members"."user_id" = "auth"."uid"()) AND ("company_members"."is_active" = true)))));



CREATE POLICY "Users can update HACCP configurations for their company" ON "public"."haccp_configurations" FOR UPDATE USING (("company_id" IN ( SELECT "company_members"."company_id"
   FROM "public"."company_members"
  WHERE (("company_members"."user_id" = "auth"."uid"()) AND ("company_members"."is_active" = true)))));



CREATE POLICY "Users can update calendar settings for their company" ON "public"."company_calendar_settings" FOR UPDATE USING (("company_id" IN ( SELECT "company_members"."company_id"
   FROM "public"."company_members"
  WHERE (("company_members"."user_id" = "auth"."uid"()) AND ("company_members"."is_active" = true)))));



CREATE POLICY "Users can update email schedules for their company" ON "public"."email_schedules" FOR UPDATE USING (("company_id" IN ( SELECT "company_members"."company_id"
   FROM "public"."company_members"
  WHERE (("company_members"."user_id" = "auth"."uid"()) AND ("company_members"."is_active" = true)))));



CREATE POLICY "Users can update inventory events for their company" ON "public"."inventory_events" FOR UPDATE USING (("company_id" IN ( SELECT "company_members"."company_id"
   FROM "public"."company_members"
  WHERE (("company_members"."user_id" = "auth"."uid"()) AND ("company_members"."is_active" = true)))));



CREATE POLICY "Users can update maintenance completions for their company" ON "public"."maintenance_completions" FOR UPDATE USING (("company_id" IN ( SELECT "company_members"."company_id"
   FROM "public"."company_members"
  WHERE (("company_members"."user_id" = "auth"."uid"()) AND ("company_members"."is_active" = true)))));



CREATE POLICY "Users can update meetings for their company" ON "public"."meetings" FOR UPDATE USING (("company_id" IN ( SELECT "company_members"."company_id"
   FROM "public"."company_members"
  WHERE (("company_members"."user_id" = "auth"."uid"()) AND ("company_members"."is_active" = true)))));



CREATE POLICY "Users can update own profile" ON "public"."user_profiles" FOR UPDATE USING ((("auth_user_id" = "auth"."uid"()) OR (("clerk_user_id")::"text" = ("auth"."jwt"() ->> 'sub'::"text")))) WITH CHECK ((("auth_user_id" = "auth"."uid"()) OR (("clerk_user_id")::"text" = ("auth"."jwt"() ->> 'sub'::"text"))));



CREATE POLICY "Users can update own session" ON "public"."user_sessions" FOR UPDATE USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can update product expiry completions for their company" ON "public"."product_expiry_completions" FOR UPDATE USING (("company_id" IN ( SELECT "company_members"."company_id"
   FROM "public"."company_members"
  WHERE (("company_members"."user_id" = "auth"."uid"()) AND ("company_members"."is_active" = true)))));



CREATE POLICY "Users can update their own preferences" ON "public"."user_preferences" FOR UPDATE USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can update training sessions for their company" ON "public"."training_sessions" FOR UPDATE USING (("company_id" IN ( SELECT "company_members"."company_id"
   FROM "public"."company_members"
  WHERE (("company_members"."user_id" = "auth"."uid"()) AND ("company_members"."is_active" = true)))));



CREATE POLICY "Users can view HACCP configurations for their company" ON "public"."haccp_configurations" FOR SELECT USING (("company_id" IN ( SELECT "company_members"."company_id"
   FROM "public"."company_members"
  WHERE (("company_members"."user_id" = "auth"."uid"()) AND ("company_members"."is_active" = true)))));



CREATE POLICY "Users can view calendar settings for their company" ON "public"."company_calendar_settings" FOR SELECT USING (("company_id" IN ( SELECT "company_members"."company_id"
   FROM "public"."company_members"
  WHERE (("company_members"."user_id" = "auth"."uid"()) AND ("company_members"."is_active" = true)))));



CREATE POLICY "Users can view email schedule logs for their company" ON "public"."email_schedule_logs" FOR SELECT USING (("company_id" IN ( SELECT "company_members"."company_id"
   FROM "public"."company_members"
  WHERE (("company_members"."user_id" = "auth"."uid"()) AND ("company_members"."is_active" = true)))));



CREATE POLICY "Users can view email schedules for their company" ON "public"."email_schedules" FOR SELECT USING (("company_id" IN ( SELECT "company_members"."company_id"
   FROM "public"."company_members"
  WHERE (("company_members"."user_id" = "auth"."uid"()) AND ("company_members"."is_active" = true)))));



CREATE POLICY "Users can view inventory events for their company" ON "public"."inventory_events" FOR SELECT USING (("company_id" IN ( SELECT "company_members"."company_id"
   FROM "public"."company_members"
  WHERE (("company_members"."user_id" = "auth"."uid"()) AND ("company_members"."is_active" = true)))));



CREATE POLICY "Users can view maintenance completions for their company" ON "public"."maintenance_completions" FOR SELECT USING (("company_id" IN ( SELECT "company_members"."company_id"
   FROM "public"."company_members"
  WHERE (("company_members"."user_id" = "auth"."uid"()) AND ("company_members"."is_active" = true)))));



CREATE POLICY "Users can view meetings for their company" ON "public"."meetings" FOR SELECT USING (("company_id" IN ( SELECT "company_members"."company_id"
   FROM "public"."company_members"
  WHERE (("company_members"."user_id" = "auth"."uid"()) AND ("company_members"."is_active" = true)))));



CREATE POLICY "Users can view own profile" ON "public"."user_profiles" FOR SELECT USING ((("auth_user_id" = "auth"."uid"()) OR (("clerk_user_id")::"text" = ("auth"."jwt"() ->> 'sub'::"text"))));



CREATE POLICY "Users can view own session" ON "public"."user_sessions" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view product expiry completions for their company" ON "public"."product_expiry_completions" FOR SELECT USING (("company_id" IN ( SELECT "company_members"."company_id"
   FROM "public"."company_members"
  WHERE (("company_members"."user_id" = "auth"."uid"()) AND ("company_members"."is_active" = true)))));



CREATE POLICY "Users can view their companies" ON "public"."companies" FOR SELECT USING (("id" IN ( SELECT "company_members"."company_id"
   FROM "public"."company_members"
  WHERE (("company_members"."user_id" = "auth"."uid"()) AND ("company_members"."is_active" = true)))));



CREATE POLICY "Users can view their memberships" ON "public"."company_members" FOR SELECT USING ((("user_id" = "auth"."uid"()) OR "public"."is_admin"("company_id")));



CREATE POLICY "Users can view their own preferences" ON "public"."user_preferences" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view training sessions for their company" ON "public"."training_sessions" FOR SELECT USING (("company_id" IN ( SELECT "company_members"."company_id"
   FROM "public"."company_members"
  WHERE (("company_members"."user_id" = "auth"."uid"()) AND ("company_members"."is_active" = true)))));



CREATE POLICY "allow_authenticated_all_email_logs" ON "public"."email_logs" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "allow_insert_email_logs" ON "public"."email_logs" FOR INSERT WITH CHECK (true);



CREATE POLICY "allow_select_restaurant_settings" ON "public"."restaurant_settings" FOR SELECT USING (true);



CREATE POLICY "allow_update_restaurant_settings" ON "public"."restaurant_settings" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "anon_insert_policy" ON "public"."booking_requests" FOR INSERT TO "anon" WITH CHECK (true);



ALTER TABLE "public"."audit_logs" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "authenticated_all_policy" ON "public"."booking_requests" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "authenticated_delete_booking_requests" ON "public"."booking_requests" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "authenticated_select_booking_requests" ON "public"."booking_requests" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "authenticated_update_booking_requests" ON "public"."booking_requests" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



ALTER TABLE "public"."booking_requests" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."companies" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."company_calendar_settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."company_members" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cons_point_custom_profile" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."conservation_points" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."csrf_tokens" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "csrf_tokens_service_role_only" ON "public"."csrf_tokens" USING (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "csrf_tokens_user_read_own" ON "public"."csrf_tokens" FOR SELECT USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."departments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."email_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."email_schedule_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."email_schedules" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."haccp_configurations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."inventory_events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."invite_tokens" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."maintenance_completions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."maintenance_tasks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."meetings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."non_conformities" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."product_categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."product_expiry_completions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."products" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "public_insert_policy" ON "public"."booking_requests" FOR INSERT WITH CHECK (true);



ALTER TABLE "public"."shopping_list_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."shopping_lists" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."staff" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."task_completions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tasks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."temperature_readings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."training_sessions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_activity_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_preferences" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_sessions" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";






















































































































































GRANT ALL ON FUNCTION "public"."calculate_next_due_date"("p_frequency" character varying, "p_completed_at" timestamp with time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_next_due_date"("p_frequency" character varying, "p_completed_at" timestamp with time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_next_due_date"("p_frequency" character varying, "p_completed_at" timestamp with time zone) TO "service_role";



GRANT ALL ON FUNCTION "public"."cleanup_expired_csrf_tokens"() TO "anon";
GRANT ALL ON FUNCTION "public"."cleanup_expired_csrf_tokens"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."cleanup_expired_csrf_tokens"() TO "service_role";



GRANT ALL ON FUNCTION "public"."ensure_user_session"() TO "anon";
GRANT ALL ON FUNCTION "public"."ensure_user_session"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."ensure_user_session"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_active_company_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_active_company_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_active_company_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_companies"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_companies"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_companies"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_role_for_company"("p_company_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_role_for_company"("p_company_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_role_for_company"("p_company_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_management_role"("p_company_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."has_management_role"("p_company_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_management_role"("p_company_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_permission"("p_company_id" "uuid", "p_permission" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."has_permission"("p_company_id" "uuid", "p_permission" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_permission"("p_company_id" "uuid", "p_permission" character varying) TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin"("p_company_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"("p_company_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"("p_company_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_company_member"("p_company_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_company_member"("p_company_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_company_member"("p_company_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."switch_active_company"("p_new_company_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."switch_active_company"("p_new_company_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."switch_active_company"("p_new_company_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."trigger_cleanup_csrf_tokens"() TO "anon";
GRANT ALL ON FUNCTION "public"."trigger_cleanup_csrf_tokens"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."trigger_cleanup_csrf_tokens"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_company_calendar_settings_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_company_calendar_settings_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_company_calendar_settings_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_maintenance_task_on_completion"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_maintenance_task_on_completion"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_maintenance_task_on_completion"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";


















GRANT ALL ON TABLE "public"."admin_users" TO "anon";
GRANT ALL ON TABLE "public"."admin_users" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_users" TO "service_role";



GRANT ALL ON TABLE "public"."audit_logs" TO "anon";
GRANT ALL ON TABLE "public"."audit_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."audit_logs" TO "service_role";



GRANT ALL ON TABLE "public"."booking_requests" TO "anon";
GRANT ALL ON TABLE "public"."booking_requests" TO "authenticated";
GRANT ALL ON TABLE "public"."booking_requests" TO "service_role";



GRANT ALL ON TABLE "public"."companies" TO "anon";
GRANT ALL ON TABLE "public"."companies" TO "authenticated";
GRANT ALL ON TABLE "public"."companies" TO "service_role";



GRANT ALL ON TABLE "public"."company_calendar_settings" TO "anon";
GRANT ALL ON TABLE "public"."company_calendar_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."company_calendar_settings" TO "service_role";



GRANT ALL ON TABLE "public"."company_members" TO "anon";
GRANT ALL ON TABLE "public"."company_members" TO "authenticated";
GRANT ALL ON TABLE "public"."company_members" TO "service_role";



GRANT ALL ON TABLE "public"."cons_point_custom_profile" TO "anon";
GRANT ALL ON TABLE "public"."cons_point_custom_profile" TO "authenticated";
GRANT ALL ON TABLE "public"."cons_point_custom_profile" TO "service_role";



GRANT ALL ON TABLE "public"."conservation_points" TO "anon";
GRANT ALL ON TABLE "public"."conservation_points" TO "authenticated";
GRANT ALL ON TABLE "public"."conservation_points" TO "service_role";



GRANT ALL ON TABLE "public"."csrf_tokens" TO "anon";
GRANT ALL ON TABLE "public"."csrf_tokens" TO "authenticated";
GRANT ALL ON TABLE "public"."csrf_tokens" TO "service_role";



GRANT ALL ON TABLE "public"."departments" TO "anon";
GRANT ALL ON TABLE "public"."departments" TO "authenticated";
GRANT ALL ON TABLE "public"."departments" TO "service_role";



GRANT ALL ON TABLE "public"."email_logs" TO "anon";
GRANT ALL ON TABLE "public"."email_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."email_logs" TO "service_role";



GRANT ALL ON TABLE "public"."email_schedule_logs" TO "anon";
GRANT ALL ON TABLE "public"."email_schedule_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."email_schedule_logs" TO "service_role";



GRANT ALL ON TABLE "public"."email_schedules" TO "anon";
GRANT ALL ON TABLE "public"."email_schedules" TO "authenticated";
GRANT ALL ON TABLE "public"."email_schedules" TO "service_role";



GRANT ALL ON TABLE "public"."events" TO "anon";
GRANT ALL ON TABLE "public"."events" TO "authenticated";
GRANT ALL ON TABLE "public"."events" TO "service_role";



GRANT ALL ON TABLE "public"."haccp_configurations" TO "anon";
GRANT ALL ON TABLE "public"."haccp_configurations" TO "authenticated";
GRANT ALL ON TABLE "public"."haccp_configurations" TO "service_role";



GRANT ALL ON TABLE "public"."inventory_events" TO "anon";
GRANT ALL ON TABLE "public"."inventory_events" TO "authenticated";
GRANT ALL ON TABLE "public"."inventory_events" TO "service_role";



GRANT ALL ON TABLE "public"."invite_tokens" TO "anon";
GRANT ALL ON TABLE "public"."invite_tokens" TO "authenticated";
GRANT ALL ON TABLE "public"."invite_tokens" TO "service_role";



GRANT ALL ON TABLE "public"."maintenance_completions" TO "anon";
GRANT ALL ON TABLE "public"."maintenance_completions" TO "authenticated";
GRANT ALL ON TABLE "public"."maintenance_completions" TO "service_role";



GRANT ALL ON TABLE "public"."maintenance_tasks" TO "anon";
GRANT ALL ON TABLE "public"."maintenance_tasks" TO "authenticated";
GRANT ALL ON TABLE "public"."maintenance_tasks" TO "service_role";



GRANT ALL ON TABLE "public"."meetings" TO "anon";
GRANT ALL ON TABLE "public"."meetings" TO "authenticated";
GRANT ALL ON TABLE "public"."meetings" TO "service_role";



GRANT ALL ON TABLE "public"."non_conformities" TO "anon";
GRANT ALL ON TABLE "public"."non_conformities" TO "authenticated";
GRANT ALL ON TABLE "public"."non_conformities" TO "service_role";



GRANT ALL ON TABLE "public"."notes" TO "anon";
GRANT ALL ON TABLE "public"."notes" TO "authenticated";
GRANT ALL ON TABLE "public"."notes" TO "service_role";



GRANT ALL ON TABLE "public"."product_categories" TO "anon";
GRANT ALL ON TABLE "public"."product_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."product_categories" TO "service_role";



GRANT ALL ON TABLE "public"."product_expiry_completions" TO "anon";
GRANT ALL ON TABLE "public"."product_expiry_completions" TO "authenticated";
GRANT ALL ON TABLE "public"."product_expiry_completions" TO "service_role";



GRANT ALL ON TABLE "public"."products" TO "anon";
GRANT ALL ON TABLE "public"."products" TO "authenticated";
GRANT ALL ON TABLE "public"."products" TO "service_role";



GRANT ALL ON TABLE "public"."restaurant_settings" TO "anon";
GRANT ALL ON TABLE "public"."restaurant_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."restaurant_settings" TO "service_role";



GRANT ALL ON TABLE "public"."shopping_list_items" TO "anon";
GRANT ALL ON TABLE "public"."shopping_list_items" TO "authenticated";
GRANT ALL ON TABLE "public"."shopping_list_items" TO "service_role";



GRANT ALL ON TABLE "public"."shopping_lists" TO "anon";
GRANT ALL ON TABLE "public"."shopping_lists" TO "authenticated";
GRANT ALL ON TABLE "public"."shopping_lists" TO "service_role";



GRANT ALL ON TABLE "public"."staff" TO "anon";
GRANT ALL ON TABLE "public"."staff" TO "authenticated";
GRANT ALL ON TABLE "public"."staff" TO "service_role";



GRANT ALL ON TABLE "public"."task_completions" TO "anon";
GRANT ALL ON TABLE "public"."task_completions" TO "authenticated";
GRANT ALL ON TABLE "public"."task_completions" TO "service_role";



GRANT ALL ON TABLE "public"."tasks" TO "anon";
GRANT ALL ON TABLE "public"."tasks" TO "authenticated";
GRANT ALL ON TABLE "public"."tasks" TO "service_role";



GRANT ALL ON TABLE "public"."temperature_readings" TO "anon";
GRANT ALL ON TABLE "public"."temperature_readings" TO "authenticated";
GRANT ALL ON TABLE "public"."temperature_readings" TO "service_role";



GRANT ALL ON TABLE "public"."training_sessions" TO "anon";
GRANT ALL ON TABLE "public"."training_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."training_sessions" TO "service_role";



GRANT ALL ON TABLE "public"."user_activity_logs" TO "anon";
GRANT ALL ON TABLE "public"."user_activity_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."user_activity_logs" TO "service_role";



GRANT ALL ON TABLE "public"."user_preferences" TO "anon";
GRANT ALL ON TABLE "public"."user_preferences" TO "authenticated";
GRANT ALL ON TABLE "public"."user_preferences" TO "service_role";



GRANT ALL ON TABLE "public"."user_profiles" TO "anon";
GRANT ALL ON TABLE "public"."user_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."user_sessions" TO "anon";
GRANT ALL ON TABLE "public"."user_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."user_sessions" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































drop extension if exists "pg_net";

alter table "public"."maintenance_tasks" drop constraint "maintenance_tasks_type_check";

alter table "public"."maintenance_tasks" add constraint "maintenance_tasks_type_check" CHECK (((type)::text = ANY ((ARRAY['temperature'::character varying, 'sanitization'::character varying, 'defrosting'::character varying, 'expiry_check'::character varying])::text[]))) not valid;

alter table "public"."maintenance_tasks" validate constraint "maintenance_tasks_type_check";


