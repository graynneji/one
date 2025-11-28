-- ===============================
-- THERAPIST TABLE (parent)
-- ===============================
create table if not exists public.therapist (
  id bigserial primary key,
  name text not null,
  email text not null unique,
  balance numeric default 0,
  therapist_id uuid references auth.users(id) on delete cascade,
  pending numeric default 0,
  total_earning numeric default 0,
  dob date,
  gender text,
  authority text,
  license text,
  specialization text,
  summary text,
  profile_picture text,
  years_of_experience numeric,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ===============================
-- USER TABLE (references therapist)
-- ===============================
create table if not exists public.user (
  id bigserial primary key,
  name text not null,
  email text not null unique,
  therapist_id int8 references public.therapist(id) on delete set null,
  user_id uuid references auth.users(id) on delete cascade,
  profile_picture text,
  phone text,
  push_tokens jsonb default '[]'::jsonb,
  selected_answers jsonb[],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ===============================
-- PATIENTS TABLE (references therapist)
-- ===============================
create table if not exists public.patients (
  id bigserial primary key,
  name text not null,
  therapist int8 references public.therapist(id) on delete cascade,
  patient_id uuid references auth.users(id) on delete cascade,
  email text not null,
  notes jsonb[] default '{}',
  is_subscribed bool default false,
  subscription text,
  session_count bigint default 0,
  profile_picture text,
  selected_answers jsonb[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ===============================
-- PATIENT NOTES TABLE (references patients)
-- ===============================
create table if not exists public.patient_notes (
  id bigserial primary key,
  content text not null,
  type text,
  is_private bool default false,
  patient_id int8 references public.patients(id) on delete cascade,
  created_at timestamptz default now()
);

-- ===============================
-- APPOINTMENT TABLE
-- ===============================
create table if not exists public.appointment (
  id bigserial primary key,
  time timestamptz not null,
  patient_id uuid,
  therapist_id uuid,
  title text,
  description text,
  background_color text,
  border_color text,
  created_at timestamptz default now()
);

-- ===============================
-- MESSAGES TABLE (references appointment)
-- ===============================
create table if not exists public.messages (
  id bigserial primary key,
  message text not null,
  sender_id uuid references auth.users(id) on delete cascade,
  reciever_id uuid references auth.users(id) on delete cascade,
  is_read bool default false,
  appointment_id int8 references public.appointment(id) on delete set null,
  created_at timestamptz default now()
);

-- ===============================
-- ARTICLE CATEGORIES TABLE
-- ===============================
create table if not exists public.categories_article (
  id bigserial primary key,
  category_name text not null unique
);

insert into public.categories_article (category_name)
values 
  ('anxiety'),
  ('depression'),
  ('relationships'),
  ('career & work'),
  ('family'),
  ('self-care'),
  ('personal growth')
on conflict do nothing;

-- ===============================
-- ARTICLE TABLE (references categories)
-- ===============================
create table if not exists public.article (
  id bigserial primary key,
  author_id uuid references auth.users(id) on delete cascade,
  author text,
  content text,
  title text,
  tags text,
  category_id int8 references public.categories_article(id) on delete set null,
  views bigint default 0,
  is_urgent bool default false,
  is_anonymous bool default false,
  image text[],
  profile_picture text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ===============================
-- ARTICLE LIKES TABLE (references article)
-- ===============================
create table if not exists public.article_likes (
  id bigserial primary key,
  user_id uuid,
  discussion_id int8 references public.article(id) on delete cascade,
  created_at timestamptz default now()
);

-- ===============================
-- ARTICLE COMMENTS TABLE (references article)
-- ===============================
create table if not exists public.article_comments (
  id bigserial primary key,
  article_id int8 references public.article(id) on delete cascade,
  content text not null,
  user_id uuid references auth.users(id) on delete cascade,
  author text,
  image text,
  profile_picture text,
  created_at timestamptz default now()
);

-- ===============================
-- Call SESSIONS TABLE (references auth.users)
-- ===============================
CREATE TABLE call_sessions (
  id BIGSERIAL PRIMARY KEY,
  caller_id UUID REFERENCES auth.users(id),
  callee_id UUID REFERENCES auth.users(id),
  call_type TEXT CHECK (call_type IN ('audio', 'video')),
  status TEXT CHECK (status IN ('ringing', 'ongoing', 'ended')),
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===============================
-- webRTC SIGNALING TABLE (references auth.users)
-- ===============================
CREATE TABLE webrtc_signaling (
  id BIGSERIAL PRIMARY KEY,
  call_session_id BIGINT REFERENCES call_sessions(id),
  from_user_id UUID REFERENCES auth.users(id),
  to_user_id UUID REFERENCES auth.users(id),
  signal_type TEXT,
  signal_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===============================
-- STORAGE BUCKETS
-- ===============================

-- Create community_images bucket
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'community_images',
  'community_images',
  true,
  3145728, -- 3MB limit
  array['image/*']
)
on conflict (id) do nothing;

-- Create profile_pictures bucket
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'profile_pictures',
  'profile_pictures',
  true,
  204800, -- 2KB limit
  array['image/*']
)
on conflict (id) do nothing;


-- ===============================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- ===============================

-- User table indexes
create index if not exists idx_user_userid on public.user(user_id);
create index if not exists idx_user_email on public.user(email);
create index if not exists idx_user_therapist on public.user(therapist_id);

-- Therapist table indexes
create index if not exists idx_therapist_userid on public.therapist(therapist_id);
create index if not exists idx_therapist_email on public.therapist(email);

-- Patients table indexes
create index if not exists idx_patients_patientid on public.patients(patient_id);
create index if not exists idx_patients_therapist on public.patients(therapist);
create index if not exists idx_patients_email on public.patients(email);

-- Patient notes indexes
create index if not exists idx_patient_notes_patient on public.patient_notes(patient_id);
create index if not exists idx_patient_notes_created on public.patient_notes(created_at desc);

-- Appointment indexes
create index if not exists idx_appointment_patient on public.appointment(patient_id);
create index if not exists idx_appointment_therapist on public.appointment(therapist_id);
create index if not exists idx_appointment_time on public.appointment(time);
create index if not exists idx_appointment_therapist_time on public.appointment(therapist_id, time);

-- Messages indexes (optimized for realtime and queries)
create index if not exists idx_messages_sender on public.messages(sender_id);
create index if not exists idx_messages_receiver on public.messages(reciever_id);
create index if not exists idx_messages_created on public.messages(created_at desc);
create index if not exists idx_messages_unread on public.messages(reciever_id, is_read) where is_read = false;
create index if not exists idx_messages_conversation on public.messages(sender_id, reciever_id, created_at desc);
create index if not exists idx_messages_appointment on public.messages(appointment_id);

-- Article indexes
create index if not exists idx_article_author on public.article(author_id);
create index if not exists idx_article_category on public.article(category_id);
create index if not exists idx_article_created on public.article(created_at desc);
create index if not exists idx_article_views on public.article(views desc);
create index if not exists idx_article_urgent on public.article(is_urgent) where is_urgent = true;
create index if not exists idx_article_tags on public.article(tags);

-- Article comments indexes
create index if not exists idx_comments_article on public.article_comments(article_id);
create index if not exists idx_comments_user on public.article_comments(user_id);
create index if not exists idx_comments_created on public.article_comments(created_at desc);

-- Article likes indexes
create index if not exists idx_likes_discussion on public.article_likes(discussion_id);
create index if not exists idx_likes_user on public.article_likes(user_id);
create unique index if not exists idx_likes_unique on public.article_likes(user_id, discussion_id);

-- call_sessions indexes
CREATE INDEX idx_call_sessions_caller_id ON call_sessions (caller_id);
CREATE INDEX idx_call_sessions_callee_id ON call_sessions (callee_id);
CREATE INDEX idx_call_sessions_status ON call_sessions (status);

-- webrtc_signaling indexes 
CREATE INDEX idx_webrtc_signaling_call_session_id ON webrtc_signaling (call_session_id);
CREATE INDEX idx_webrtc_signaling_from_user_id ON webrtc_signaling (from_user_id);
CREATE INDEX idx_webrtc_signaling_to_user_id ON webrtc_signaling (to_user_id);
CREATE INDEX idx_webrtc_signaling_signal_type ON webrtc_signaling (signal_type);


-- ===============================
-- ROW LEVEL SECURITY (RLS)
-- ===============================

-- Enable RLS for all tables
alter table public.user enable row level security;
alter table public.therapist enable row level security;
alter table public.patients enable row level security;
alter table public.patient_notes enable row level security;
alter table public.messages enable row level security;
alter table public.categories_article enable row level security;
alter table public.article enable row level security;
alter table public.article_comments enable row level security;
alter table public.article_likes enable row level security;
alter table public.appointment enable row level security;
alter table public.call_sessions enable row level security;
alter table public.webrtc_signaling enable row level security;

-- ===============================
-- USER POLICIES (with insert enabled)
-- ===============================
create policy "user_select" on public.user 
  for select to authenticated using (true);

create policy "user_insert" on public.user 
  for insert to authenticated with check (true);

create policy "user_update" on public.user 
  for update to authenticated using (true) with check (true);

create policy "user_delete" on public.user 
  for delete to authenticated using (true);

-- ===============================
-- THERAPIST POLICIES (with insert enabled)
-- ===============================
create policy "therapist_select" on public.therapist 
  for select to authenticated using (true);

create policy "therapist_insert" on public.therapist 
  for insert to authenticated with check (true);

create policy "therapist_update" on public.therapist 
  for update to authenticated using (true) with check (true);

create policy "therapist_delete" on public.therapist 
  for delete to authenticated using (true);

-- ===============================
-- PATIENTS POLICIES (with insert enabled)
-- ===============================
create policy "patients_select" on public.patients 
  for select to authenticated using (true);

create policy "patients_insert" on public.patients 
  for insert to authenticated with check (true);

create policy "patients_update_for_all" on public.patients 
  for update to public using (true) with check (true);

create policy "patients_delete" on public.patients 
  for delete to authenticated using (true);

-- ===============================
-- PATIENT NOTES POLICIES
-- ===============================
create policy "notes_select" on public.patient_notes 
  for select to authenticated using (true);

create policy "notes_insert" on public.patient_notes 
  for insert to authenticated with check (true);

create policy "notes_update" on public.patient_notes 
  for update to authenticated using (true) with check (true);

create policy "notes_delete" on public.patient_notes 
  for delete to authenticated using (true);

-- ===============================
-- MESSAGES POLICIES (REALTIME ENABLED)
-- ===============================
create policy "messages_select" on public.messages 
  for select to authenticated 
  using (auth.uid() = sender_id or auth.uid() = reciever_id);

create policy "messages_insert" on public.messages 
  for insert to authenticated 
  with check (auth.uid() = sender_id);

create policy "messages_update" on public.messages 
  for update to authenticated 
  using (auth.uid() = reciever_id)
  with check (auth.uid() = reciever_id);

create policy "messages_delete" on public.messages 
  for delete to authenticated 
  using (auth.uid() = sender_id or auth.uid() = reciever_id);


-- ===============================
-- CATEGORIES ARTICLE POLICIES
-- ===============================
create policy "select_for_all" on public.categories_article 
  for select to public using (true);

-- ===============================
-- ARTICLE POLICIES
-- ===============================
create policy "article_select_for_all" on public.article 
  for select to public using (true);

create policy "article_insert" on public.article 
  for insert to authenticated with check (true);

create policy "article_update_for_all" on public.article 
  for update to public using (true) with check (true);

create policy "article_delete" on public.article 
  for delete to authenticated using (true);

-- ===============================
-- ARTICLE COMMENTS POLICIES
-- ===============================
create policy "comments_select" on public.article_comments 
  for select to authenticated using (true);

create policy "comments_insert" on public.article_comments 
  for insert to authenticated with check (true);

create policy "comments_update" on public.article_comments 
  for update to authenticated using (true) with check (true);

create policy "comments_delete" on public.article_comments 
  for delete to authenticated using (true);

-- ===============================
-- ARTICLE LIKES POLICIES
-- ===============================
create policy "likes_select" on public.article_likes 
  for select to authenticated using (true);

create policy "likes_insert" on public.article_likes 
  for insert to authenticated with check (true);

create policy "likes_update" on public.article_likes 
  for update to authenticated using (true) with check (true);

create policy "likes_delete" on public.article_likes 
  for delete to authenticated using (true);

-- ===============================
-- APPOINTMENT POLICIES
-- ===============================
create policy "appointment_select" on public.appointment 
  for select to authenticated using (true);

create policy "appointment_insert" on public.appointment 
  for insert to authenticated with check (true);

create policy "appointment_update" on public.appointment 
  for update to authenticated using (true) with check (true);

create policy "appointment_delete" on public.appointment 
  for delete to authenticated using (true);

-- ===============================
-- CALL SESSIONS POLICIES
-- ===============================
create policy "Users can view their own call sessions" on call_sessions
  for select using (auth.uid() = caller_id OR auth.uid() = callee_id);

create policy "Users can create calls as caller" on call_sessions
  for insert with check (auth.uid() = caller_id);

create policy "Users can update their own call sessions" on call_sessions
  for update using (auth.uid() = caller_id OR auth.uid() = callee_id);

-- Optional: Disallow deletes for safety
create policy "No direct deletes" on call_sessions
  for delete using (false);

-- ===============================
-- WEBRTC SIGNALING POLICIES
-- ===============================
create policy "Users can view signaling data for their calls" on webrtc_signaling
  for select using (auth.uid() = from_user_id OR auth.uid() = to_user_id);

create policy "Users can send signaling data" on webrtc_signaling
  for insert with check (auth.uid() = from_user_id);

-- Allow updates only by sender (rare, but safe)
create policy "Users can update their own signaling messages" on webrtc_signaling
  for update using (auth.uid() = from_user_id);

-- Prevent direct deletion
create policy "No direct deletes" on webrtc_signaling
  for delete using (false);

-- ===============================
-- COMMUNITY_IMAGES BUCKET POLICIES
-- ===============================

-- Allow All users to upload
CREATE POLICY "All hd33wu_1"
ON storage.objects FOR INSERT 
TO public WITH CHECK (bucket_id = 'community_images');

-- Allow All users to view
CREATE POLICY "All hd33wu_0" 
ON storage.objects FOR SELECT 
TO public USING (bucket_id = 'community_images');

-- Allow All users to update
CREATE POLICY "All hd33wu_3" 
ON storage.objects FOR UPDATE 
TO public USING (bucket_id = 'community_images');

-- Allow All users to delete
CREATE POLICY "All hd33wu_2" 
ON storage.objects FOR DELETE 
TO public USING (bucket_id = 'community_images');

-- ===============================
-- PROFILE_PICTURES BUCKET POLICIES
-- ===============================

-- Allow All users to upload
CREATE POLICY "All 1pmf6kr_1"
ON storage.objects FOR INSERT 
TO public WITH CHECK (bucket_id = 'profile_pictures');

-- Allow All users to view
CREATE POLICY "All 1pmf6kr_0" 
ON storage.objects FOR SELECT 
TO public USING (bucket_id = 'profile_pictures');

-- Allow All users to update
CREATE POLICY "All 1pmf6kr_3" 
ON storage.objects FOR UPDATE 
TO public USING (bucket_id = 'profile_pictures');

-- Allow All users to delete 
CREATE POLICY "All 1pmf6kr_2" 
ON storage.objects FOR DELETE 
TO public USING (bucket_id = 'profile_pictures');

-- ===============================
-- ENABLE REALTIME FOR MESSAGES
-- ===============================
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- ===============================
-- ENABLE REALTIME FOR WEBRTC_SIGNALING
-- ===============================
ALTER PUBLICATION supabase_realtime ADD TABLE public.webrtc_signaling;

-- ===============================
-- FUNCTION: increment_views_bigint - views column in article
-- ===============================
CREATE OR REPLACE FUNCTION public.increment_views_bigint(article_id bigint)
 RETURNS bigint
 LANGUAGE plpgsql
AS $function$
declare
  new_views bigint;
begin
  update article
  set views = views + 1
  where id = article_id
  returning views into new_views;

  return new_views;
end;
$function$;

-- ===============================
-- FUNCTION: increment_views_bigint - session_count column in patients
-- ===============================
CREATE OR REPLACE FUNCTION public.increment_patient_session(p_patient_id uuid)
 RETURNS bigint
 LANGUAGE plpgsql
AS $function$
DECLARE
  new_session_count bigint;
BEGIN
  -- Increment session_count and store the new value
  UPDATE patients
  SET session_count = COALESCE(session_count, 0) + 1
  WHERE patient_id = p_patient_id
  RETURNING session_count INTO new_session_count;

  -- Return the updated session_count
  RETURN new_session_count;
END;
$function$;


-- ===============================
-- FUNCTION: Update push token
-- ===============================
CREATE OR REPLACE FUNCTION public.upsert_push_token(
  p_user_id UUID,
  p_token TEXT,
  p_platform TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_existing_tokens JSONB;
  v_new_tokens JSONB;
BEGIN
  SELECT COALESCE(push_tokens, '[]'::jsonb)
  INTO v_existing_tokens
  FROM public.user
  WHERE user_id = p_user_id;

  v_new_tokens := (
    SELECT jsonb_agg(token)
    FROM jsonb_array_elements(v_existing_tokens) AS token
    WHERE token->>'platform' != p_platform
  );

  v_new_tokens := COALESCE(v_new_tokens, '[]'::jsonb) || 
    jsonb_build_object(
      'token', p_token,
      'platform', p_platform,
      'updated_at', NOW()
    );

  UPDATE public.user
  SET push_tokens = v_new_tokens,
      updated_at = NOW()
  WHERE user_id = p_user_id;
END;
$$;

-- ===============================
-- TRIGGER: Send notification on new message (SIMPLIFIED)
-- ===============================
CREATE OR REPLACE FUNCTION public.notify_new_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER  -- ← This is the magic that makes it work!
SET search_path = public
AS $$
DECLARE
  v_sender_name TEXT;
  v_receiver_tokens JSONB;
  v_token_array TEXT[];
BEGIN
  -- Get sender's name
  SELECT COALESCE(name, email)
  INTO v_sender_name
  FROM public.user
  WHERE user_id = NEW.sender_id
  LIMIT 1;

  -- Get receiver's push tokens
  SELECT push_tokens
  INTO v_receiver_tokens
  FROM public.user
  WHERE user_id = NEW.reciever_id;

  -- Extract token strings into array
  SELECT ARRAY_AGG(token->>'token')
  INTO v_token_array
  FROM jsonb_array_elements(COALESCE(v_receiver_tokens, '[]'::jsonb)) AS token;

  -- Send push notification if tokens exist
  IF v_token_array IS NOT NULL AND ARRAY_LENGTH(v_token_array, 1) > 0 THEN
    PERFORM extensions.http((
      'POST',
      'https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-push',  -- ← REPLACE THIS!
      ARRAY[
        extensions.http_header('Content-Type', 'application/json'),
        extensions.http_header('Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true))
      ],
      'application/json',
      jsonb_build_object(
        'to', v_token_array,
        'title', COALESCE(v_sender_name, 'New Message'),
        'body', SUBSTRING(NEW.message, 1, 100),
        'data', jsonb_build_object(
          'type', 'message',
          'messageId', NEW.id::text,
          'senderId', NEW.sender_id::text,
          'senderName', v_sender_name,
          'receiverId', NEW.reciever_id::text
        ),
        'channelId', 'messages'
      )::text
    )::extensions.http_request);
  END IF;

  RETURN NEW;
END;
$$;


-- ===============================
-- TRIGGER: Send notification on incoming call (SIMPLIFIED)
-- ===============================
CREATE OR REPLACE FUNCTION public.notify_incoming_call()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER  -- ← This is the magic that makes it work!
SET search_path = public
AS $$
DECLARE
  v_caller_name TEXT;
  v_callee_tokens JSONB;
  v_token_array TEXT[];
  v_call_type_display TEXT;
BEGIN
  -- Only notify if status is 'ringing'
  IF NEW.status != 'ringing' THEN
    RETURN NEW;
  END IF;

  -- Get caller's name
  SELECT COALESCE(name, email)
  INTO v_caller_name
  FROM public.user
  WHERE user_id = NEW.caller_id
  LIMIT 1;

  -- Get callee's push tokens
  SELECT push_tokens
  INTO v_callee_tokens
  FROM public.user
  WHERE user_id = NEW.callee_id;

  -- Extract token strings
  SELECT ARRAY_AGG(token->>'token')
  INTO v_token_array
  FROM jsonb_array_elements(COALESCE(v_callee_tokens, '[]'::jsonb)) AS token;

  -- Format call type
  v_call_type_display := CASE 
    WHEN NEW.call_type = 'video' THEN 'Video Call'
    ELSE 'Audio Call'
  END;

  -- Send notification
  IF v_token_array IS NOT NULL AND ARRAY_LENGTH(v_token_array, 1) > 0 THEN
    PERFORM extensions.http((
      'POST',
      'https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-push',  -- ← REPLACE THIS!
      ARRAY[
        extensions.http_header('Content-Type', 'application/json'),
        extensions.http_header('Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true))
      ],
      'application/json',
      jsonb_build_object(
        'to', v_token_array,
        'title', COALESCE(v_caller_name, 'Incoming Call'),
        'body', 'Incoming ' || v_call_type_display,
        'data', jsonb_build_object(
          'type', 'incoming_call',
          'callSessionId', NEW.id::text,
          'callerId', NEW.caller_id::text,
          'callerName', v_caller_name,
          'calleeId', NEW.callee_id::text,
          'callType', NEW.call_type
        ),
        'channelId', 'calls'
      )::text
    )::extensions.http_request);
  END IF;

  RETURN NEW;
END;
$$;

-- Apply triggers
DROP TRIGGER IF EXISTS trigger_notify_new_message ON public.messages;
CREATE TRIGGER trigger_notify_new_message
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_message();

DROP TRIGGER IF EXISTS trigger_notify_incoming_call ON public.call_sessions;
CREATE TRIGGER trigger_notify_incoming_call
  AFTER INSERT ON public.call_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_incoming_call();

