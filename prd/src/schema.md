//supabse schema 
-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.assigned_nutrition (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL,
  template_id uuid,
  structure jsonb NOT NULL DEFAULT '{}'::jsonb,
  documents jsonb NOT NULL DEFAULT '[]'::jsonb,
  scheduled_start_date date,
  scheduled_end_date date,
  status text DEFAULT 'active'::text CHECK (status = ANY (ARRAY['pending'::text, 'active'::text, 'completed'::text, 'paused'::text])),
  client_notes text,
  coach_notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT assigned_nutrition_pkey PRIMARY KEY (id),
  CONSTRAINT assigned_nutrition_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.profiles(id),
  CONSTRAINT assigned_nutrition_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.nutrition_templates(id)
);
CREATE TABLE public.assigned_workouts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL,
  template_id uuid,
  structure jsonb NOT NULL DEFAULT '{"weeks": []}'::jsonb,
  scheduled_start_date date,
  scheduled_end_date date,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'active'::text, 'completed'::text])),
  client_notes text,
  is_editable_by_client boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  coach_notes text,
  progress_data jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT assigned_workouts_pkey PRIMARY KEY (id),
  CONSTRAINT assigned_workouts_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.users(id),
  CONSTRAINT assigned_workouts_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.workout_templates(id)
);
CREATE TABLE public.check_ins (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  date date DEFAULT CURRENT_DATE,
  weight_kg numeric,
  waist_cm numeric,
  photos jsonb DEFAULT '{"back": null, "side": null, "front": null}'::jsonb,
  coach_feedback text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT check_ins_pkey PRIMARY KEY (id),
  CONSTRAINT check_ins_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.client_privacy_settings (
  user_id uuid NOT NULL,
  can_view_own_workout_plan boolean DEFAULT true,
  can_view_own_nutrition_plan boolean DEFAULT true,
  can_view_own_clinical_history boolean DEFAULT false,
  can_view_own_check_ins boolean DEFAULT true,
  can_edit_assigned_workouts boolean DEFAULT true,
  can_submit_check_ins boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT client_privacy_settings_pkey PRIMARY KEY (user_id),
  CONSTRAINT client_privacy_settings_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.exercise_library (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  name_es text,
  muscle_group text NOT NULL,
  secondary_muscles ARRAY DEFAULT '{}'::text[],
  equipment text,
  exercise_type text DEFAULT 'strength'::text,
  difficulty text DEFAULT 'intermediate'::text,
  video_url text,
  thumbnail_url text,
  instructions text,
  tips ARRAY,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT exercise_library_pkey PRIMARY KEY (id)
);
CREATE TABLE public.landing_content (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  content_type text NOT NULL CHECK (content_type = ANY (ARRAY['hero'::text, 'seo_meta'::text])),
  title text,
  subtitle text,
  cta_text text,
  cta_link text,
  image_url text,
  image_storage_path text,
  meta_title text,
  meta_description text,
  og_image_url text,
  og_title text,
  og_description text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  description text,
  CONSTRAINT landing_content_pkey PRIMARY KEY (id)
);
CREATE TABLE public.landing_programs (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  subtitle text,
  description text,
  icon_name text DEFAULT 'Archive'::text,
  image_url text,
  image_storage_path text,
  is_large boolean DEFAULT false,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT landing_programs_pkey PRIMARY KEY (id)
);
CREATE TABLE public.landing_transformations (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  client_name text NOT NULL,
  plan_name text NOT NULL,
  before_image_url text NOT NULL,
  after_image_url text NOT NULL,
  before_storage_path text,
  after_storage_path text,
  testimonial text,
  metrics jsonb DEFAULT '{}'::jsonb,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT landing_transformations_pkey PRIMARY KEY (id)
);
CREATE TABLE public.magic_link_tokens (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email text NOT NULL,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamp with time zone NOT NULL,
  used_at timestamp with time zone,
  is_onboarding boolean DEFAULT false,
  invited_by uuid,
  initial_permissions jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT magic_link_tokens_pkey PRIMARY KEY (id),
  CONSTRAINT magic_link_tokens_invited_by_fkey FOREIGN KEY (invited_by) REFERENCES auth.users(id)
);
CREATE TABLE public.nutrition_plans (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  title text DEFAULT 'Plan Nutricional'::text,
  macros jsonb DEFAULT '{"fat": 70, "carbs": 250, "protein": 180, "calories": 2500}'::jsonb,
  documents jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  hydration_notes text,
  water_target_liters numeric DEFAULT 2.5,
  CONSTRAINT nutrition_plans_pkey PRIMARY KEY (id),
  CONSTRAINT nutrition_plans_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.nutrition_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  coach_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  structure jsonb NOT NULL DEFAULT '{"macros": {"fat": 70, "carbs": 200, "protein": 150, "calories": 2000}, "water_target_liters": 2.5}'::jsonb,
  documents jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_public boolean DEFAULT false,
  tags ARRAY DEFAULT '{}'::text[],
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT nutrition_templates_pkey PRIMARY KEY (id),
  CONSTRAINT nutrition_templates_coach_id_fkey FOREIGN KEY (coach_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.payment_records (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  profile_id uuid,
  year integer NOT NULL,
  month integer NOT NULL CHECK (month >= 1 AND month <= 12),
  amount numeric NOT NULL,
  payment_method text CHECK (payment_method = ANY (ARRAY['stripe'::text, 'cash'::text, 'transfer'::text])),
  plan_type text,
  status text DEFAULT 'paid'::text CHECK (status = ANY (ARRAY['paid'::text, 'pending'::text, 'failed'::text])),
  stripe_invoice_id text,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT payment_records_pkey PRIMARY KEY (id),
  CONSTRAINT payment_records_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.permission_audit_log (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  changed_by uuid NOT NULL,
  target_user_id uuid NOT NULL,
  action text NOT NULL CHECK (action = ANY (ARRAY['grant'::text, 'revoke'::text, 'assign_client'::text, 'unassign_client'::text])),
  permission_name text,
  old_value boolean,
  new_value boolean,
  client_id uuid,
  assignment_type text,
  reason text,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT permission_audit_log_pkey PRIMARY KEY (id),
  CONSTRAINT permission_audit_log_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES auth.users(id),
  CONSTRAINT permission_audit_log_target_user_id_fkey FOREIGN KEY (target_user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  email text UNIQUE,
  full_name text,
  avatar_url text,
  stripe_customer_id text,
  subscription_status text DEFAULT 'inactive'::text CHECK (subscription_status = ANY (ARRAY['active'::text, 'past_due'::text, 'canceled'::text, 'manual_cash'::text, 'trialing'::text, 'inactive'::text])),
  subscription_tier text,
  access_tags ARRAY DEFAULT '{}'::text[],
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  notes text,
  user_status text DEFAULT 'pending'::text CHECK (user_status = ANY (ARRAY['pending'::text, 'stripe'::text, 'cash'::text, 'canceled'::text])),
  stripe_product_id text,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.recommendation_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  coach_id uuid NOT NULL,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  category text NOT NULL CHECK (category = ANY (ARRAY['cardiovascular'::text, 'metabolico'::text, 'muscular'::text, 'general'::text])),
  content jsonb NOT NULL DEFAULT '{"restrictions": [], "dietary_notes": [], "recommendations": [], "contraindicated_exercises": []}'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT recommendation_templates_pkey PRIMARY KEY (id),
  CONSTRAINT recommendation_templates_coach_id_fkey FOREIGN KEY (coach_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.staff_client_assignments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  staff_id uuid NOT NULL,
  client_id uuid NOT NULL,
  assignment_type text NOT NULL CHECK (assignment_type = ANY (ARRAY['workout_coach'::text, 'nutritionist'::text, 'both'::text])),
  assigned_at timestamp with time zone DEFAULT now(),
  ends_at timestamp with time zone,
  is_active boolean DEFAULT true,
  CONSTRAINT staff_client_assignments_pkey PRIMARY KEY (id),
  CONSTRAINT staff_client_assignments_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES auth.users(id),
  CONSTRAINT staff_client_assignments_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.users(id)
);
CREATE TABLE public.staff_permissions (
  user_id uuid NOT NULL,
  is_super_admin boolean DEFAULT false,
  can_view_users boolean DEFAULT false,
  can_create_users boolean DEFAULT false,
  can_edit_users boolean DEFAULT false,
  can_view_workout_plans boolean DEFAULT false,
  can_create_workout_plans boolean DEFAULT false,
  can_edit_workout_plans boolean DEFAULT false,
  can_create_workout_templates boolean DEFAULT false,
  can_view_nutrition_plans boolean DEFAULT false,
  can_create_nutrition_plans boolean DEFAULT false,
  can_edit_nutrition_plans boolean DEFAULT false,
  can_view_clinical_history boolean DEFAULT false,
  can_edit_clinical_history boolean DEFAULT false,
  can_view_sales boolean DEFAULT false,
  can_manage_subscriptions boolean DEFAULT false,
  can_edit_landing_content boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT staff_permissions_pkey PRIMARY KEY (user_id),
  CONSTRAINT staff_permissions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.stripe_plans (
  id text NOT NULL,
  price_id text NOT NULL,
  name text NOT NULL,
  description text,
  price integer NOT NULL,
  currency text NOT NULL DEFAULT 'mxn'::text,
  interval text NOT NULL DEFAULT 'month'::text,
  access_tags ARRAY NOT NULL DEFAULT '{}'::text[],
  plan_type text DEFAULT 'online'::text,
  is_online boolean DEFAULT true,
  is_recommended boolean DEFAULT false,
  display_order integer DEFAULT 99,
  color text,
  active boolean DEFAULT true,
  synced_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT stripe_plans_pkey PRIMARY KEY (id)
);
CREATE TABLE public.user_status_history (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  month date NOT NULL,
  status text NOT NULL CHECK (status = ANY (ARRAY['pending'::text, 'stripe'::text, 'cash'::text, 'canceled'::text])),
  subscription_tier text,
  amount_paid numeric,
  payment_method text,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_status_history_pkey PRIMARY KEY (id),
  CONSTRAINT user_status_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.workout_plans (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  coach_id uuid,
  title text NOT NULL,
  start_date date DEFAULT CURRENT_DATE,
  end_date date,
  is_active boolean DEFAULT true,
  structure jsonb NOT NULL DEFAULT '{"weeks": []}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT workout_plans_pkey PRIMARY KEY (id),
  CONSTRAINT workout_plans_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT workout_plans_coach_id_fkey FOREIGN KEY (coach_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.workout_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  coach_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  structure jsonb NOT NULL DEFAULT '{"weeks": []}'::jsonb,
  is_public boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  tags ARRAY DEFAULT '{}'::text[],
  difficulty text DEFAULT 'intermediate'::text,
  CONSTRAINT workout_templates_pkey PRIMARY KEY (id),
  CONSTRAINT workout_templates_coach_id_fkey FOREIGN KEY (coach_id) REFERENCES auth.users(id)
);