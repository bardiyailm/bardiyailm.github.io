-- ========== community10.sql — الحصص المباشرة (أونلاين) لمجموعات المعلمين ==========
-- إضافات فقط: جدولان جديدان + دوال. لا يغيّر أي جدول أو دالة موجودة.
-- الحصة نفسها تجري على Jitsi Meet المجاني (حتى ~100 طالب)، واسم الغرفة سرّ عشوائي 128-bit
-- لا يُعطى إلا لأعضاء المجموعة، ويختفي بعد إنهاء الحصة. الحضور يُسجَّل تلقائياً عند الانضمام.

create table if not exists live_sessions(
  id bigserial primary key,
  teacher_id uuid not null references teachers(user_id) on delete cascade,
  title text not null default '',
  status text not null default 'scheduled' check (status in ('scheduled','live','ended','canceled')),
  room text,
  starts_at timestamptz not null default now(),
  minutes int not null default 90 check (minutes between 15 and 300),
  started_by uuid references auth.users on delete set null,
  ended_at timestamptz,
  created_at timestamptz not null default now());
create index if not exists live_sessions_t on live_sessions(teacher_id,status,starts_at);

create table if not exists live_attendance(
  session_id bigint not null references live_sessions(id) on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  name text not null default '',
  joined_at timestamptz not null default now(),
  primary key(session_id,user_id));

alter table live_sessions enable row level security;
alter table live_attendance enable row level security;
revoke all on live_sessions,live_attendance from anon,authenticated;

-- المعلم المعتمد صاحب المجموعة أو أحد مشرفيها
create or replace function lv_staff(p_teacher uuid,p_user uuid) returns boolean
language sql stable security definer set search_path=public as $$
  select p_user is not null
    and exists(select 1 from teachers where user_id=p_teacher and approved)
    and (p_user=p_teacher or cm_is_sup(p_teacher,p_user)) $$;

-- إنهاء تلقائي لحصة نُسي إنهاؤها (مدتها + ساعتان) ولموعد مضى عليه 12 ساعة دون بدء
create or replace function lv_tidy(p_teacher uuid) returns void
language sql security definer set search_path=public as $$
  update live_sessions set status='ended',ended_at=coalesce(ended_at,now())
   where teacher_id=p_teacher and status='live' and starts_at<now()-make_interval(mins=>minutes+120);
  update live_sessions set status='canceled'
   where teacher_id=p_teacher and status='scheduled' and starts_at<now()-interval '12 hours' $$;

create or replace function lv_schedule(p_teacher uuid,p_title text,p_at timestamptz,p_minutes int) returns bigint
language plpgsql security definer set search_path=public as $$
declare me uuid:=auth.uid(); t text:=btrim(coalesce(p_title,'')); n bigint;
begin
  if not lv_staff(p_teacher,me) then raise exception 'denied'; end if;
  if length(t)<2 or length(t)>80 then raise exception 'lv_title'; end if;
  if cm_profane(t) then raise exception 'profane'; end if;
  if p_at is null or p_at<now()-interval '5 minutes' or p_at>now()+interval '60 days' then raise exception 'lv_time'; end if;
  perform lv_tidy(p_teacher);
  if (select count(*) from live_sessions where teacher_id=p_teacher and status='scheduled')>=30 then raise exception 'lv_many'; end if;
  insert into live_sessions(teacher_id,title,status,starts_at,minutes,started_by)
    values(p_teacher,t,'scheduled',p_at,least(greatest(coalesce(p_minutes,90),15),300),me) returning id into n;
  return n;
end $$;

-- بدء حصة الآن (جديدة أو من موعد مجدول). حصة واحدة جارية لكل مجموعة: إن وُجدت تُعاد كما هي.
create or replace function lv_start(p_teacher uuid,p_id bigint,p_title text,p_minutes int) returns table(s_id bigint,s_room text)
language plpgsql security definer set search_path=public as $$
declare me uuid:=auth.uid(); sid bigint; cur text; t text:=left(btrim(coalesce(p_title,'')),80);
  r text:='BardiyaIlm-'||replace(gen_random_uuid()::text,'-','');
begin
  if not lv_staff(p_teacher,me) then raise exception 'denied'; end if;
  perform lv_tidy(p_teacher);
  select ls.id,ls.room into sid,cur from live_sessions ls where ls.teacher_id=p_teacher and ls.status='live' order by ls.starts_at desc limit 1;
  if sid is not null then return query select sid,cur; return; end if;
  if (select count(*) from live_sessions where teacher_id=p_teacher and room is not null and starts_at>now()-interval '1 day')>=20 then raise exception 'lv_many'; end if;
  if length(t)>0 and cm_profane(t) then raise exception 'profane'; end if;
  if p_id is not null then
    update live_sessions set status='live',room=r,starts_at=now(),started_by=me
     where id=p_id and teacher_id=p_teacher and status='scheduled' returning id into sid;
  end if;
  if sid is null then
    if length(t)<2 then t:='حصة مباشرة'; end if;
    insert into live_sessions(teacher_id,title,status,room,starts_at,minutes,started_by)
      values(p_teacher,t,'live',r,now(),least(greatest(coalesce(p_minutes,90),15),300),me) returning id into sid;
  end if;
  return query select sid,r;
end $$;

create or replace function lv_end(p_teacher uuid) returns void
language plpgsql security definer set search_path=public as $$
begin
  if not lv_staff(p_teacher,auth.uid()) then raise exception 'denied'; end if;
  update live_sessions set status='ended',ended_at=now() where teacher_id=p_teacher and status='live';
end $$;

create or replace function lv_cancel(p_id bigint) returns void
language plpgsql security definer set search_path=public as $$
declare t uuid;
begin
  select teacher_id into t from live_sessions where id=p_id and status='scheduled';
  if t is null or not lv_staff(t,auth.uid()) then raise exception 'denied'; end if;
  update live_sessions set status='canceled' where id=p_id;
end $$;

-- حصص مجموعة واحدة: الجارية والمجدولة للجميع، والسابقة (آخر 60 يوماً) للمعلم والمشرفين فقط.
-- اسم الغرفة يُعطى للمعلم والمشرفين هنا، أما الطالب فيأخذه عبر lv_join ليُسجَّل حضوره.
create or replace function lv_list(p_teacher uuid) returns table(s_id bigint,s_title text,s_status text,s_at timestamptz,s_minutes int,s_room text,s_count int)
language plpgsql security definer set search_path=public as $$
declare me uuid:=auth.uid(); staff boolean;
begin
  if me is null or not cm_can('g:'||p_teacher::text,me) then raise exception 'denied'; end if;
  staff:=lv_staff(p_teacher,me);
  perform lv_tidy(p_teacher);
  return query
    select ls.id,ls.title,ls.status,ls.starts_at,ls.minutes,
      case when staff and ls.status='live' then ls.room end,
      case when staff then (select count(*)::int from live_attendance a where a.session_id=ls.id) end
    from live_sessions ls
    where ls.teacher_id=p_teacher
      and (ls.status in ('live','scheduled') or (staff and ls.status='ended' and ls.room is not null and ls.starts_at>now()-interval '60 days'))
    order by case ls.status when 'live' then 0 when 'scheduled' then 1 else 2 end,
             case when ls.status='ended' then -extract(epoch from ls.starts_at) else extract(epoch from ls.starts_at) end
    limit 40;
end $$;

-- كل الحصص الجارية والقادمة (7 أيام) في مجموعاتي كطالب أو مشرف — للتنبيهات واللافتات
create or replace function lv_mine() returns table(s_id bigint,s_teacher uuid,s_group text,s_title text,s_status text,s_at timestamptz,s_minutes int)
language sql stable security definer set search_path=public as $$
  select ls.id,ls.teacher_id,coalesce(nullif(t.group_name,''),t.name),ls.title,ls.status,ls.starts_at,ls.minutes
  from live_sessions ls join teachers t on t.user_id=ls.teacher_id and t.approved
  where auth.uid() is not null
    and (exists(select 1 from group_members g where g.teacher_id=ls.teacher_id and g.student_id=auth.uid())
         or cm_is_sup(ls.teacher_id,auth.uid()))
    and not exists(select 1 from community_profiles p where p.user_id=auth.uid() and p.banned)
    and ((ls.status='live' and ls.starts_at>now()-make_interval(mins=>ls.minutes+120))
      or (ls.status='scheduled' and ls.starts_at between now()-interval '2 hours' and now()+interval '7 days'))
  order by (ls.status='live') desc,ls.starts_at
  limit 20 $$;

-- انضمام: يعيد اسم الغرفة ويسجّل حضور الطالب (مرة واحدة لكل حصة)
create or replace function lv_join(p_id bigint) returns text
language plpgsql security definer set search_path=public as $$
declare me uuid:=auth.uid(); s live_sessions%rowtype; nm text;
begin
  select * into s from live_sessions where id=p_id;
  if s.id is null or me is null or not cm_can('g:'||s.teacher_id::text,me) then raise exception 'denied'; end if;
  if s.status<>'live' or s.starts_at<now()-make_interval(mins=>s.minutes+120) then raise exception 'lv_over'; end if;
  if not lv_staff(s.teacher_id,me) then
    select name into nm from community_profiles where user_id=me;
    insert into live_attendance(session_id,user_id,name) values(p_id,me,coalesce(nm,'')) on conflict do nothing;
  end if;
  return s.room;
end $$;

-- كشف الحضور والغياب لحصة (للمعلم والمشرفين)
create or replace function lv_attendance(p_id bigint) returns table(a_name text,a_stage text,a_at timestamptz,a_present boolean)
language plpgsql security definer set search_path=public as $$
declare t uuid;
begin
  select teacher_id into t from live_sessions where id=p_id;
  if t is null or not lv_staff(t,auth.uid()) then raise exception 'denied'; end if;
  return query
    select coalesce(nullif(a.name,''),p.name,'طالب'),p.stage,a.joined_at,true
      from live_attendance a left join community_profiles p on p.user_id=a.user_id where a.session_id=p_id
    union all
    select coalesce(p.name,'طالب'),p.stage,null::timestamptz,false
      from group_members g left join community_profiles p on p.user_id=g.student_id
     where g.teacher_id=t and not exists(select 1 from live_attendance a where a.session_id=p_id and a.user_id=g.student_id)
    order by 4 desc,3,1;
end $$;

revoke all on function lv_staff(uuid,uuid),lv_tidy(uuid) from public,anon,authenticated;
grant execute on function lv_staff(uuid,uuid),lv_tidy(uuid) to service_role;
revoke all on function lv_schedule(uuid,text,timestamptz,int),lv_start(uuid,bigint,text,int),lv_end(uuid),lv_cancel(bigint),
  lv_list(uuid),lv_mine(),lv_join(bigint),lv_attendance(bigint) from public,anon;
grant execute on function lv_schedule(uuid,text,timestamptz,int),lv_start(uuid,bigint,text,int),lv_end(uuid),lv_cancel(bigint),
  lv_list(uuid),lv_mine(),lv_join(bigint),lv_attendance(bigint) to authenticated;
