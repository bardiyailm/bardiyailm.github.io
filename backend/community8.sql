-- المرحلة 8: لوحة الشرف الأسبوعية داخل مجموعة المعلم (بالموافقة: الطالب هو من يختار المشاركة)
-- شغّل هذا الملف مرة واحدة في Supabase → SQL Editor.
create table if not exists weekly_scores(
  user_id uuid not null,
  week date not null,
  points int not null default 0,
  mins int not null default 0,
  updated_at timestamptz not null default now(),
  primary key(user_id,week)
);
alter table weekly_scores enable row level security;  -- بلا سياسات: الوصول فقط عبر الدوال أدناه

create or replace function lb_week() returns date language sql stable as $$
  select date_trunc('week', now() at time zone 'Africa/Cairo')::date $$;

create or replace function lb_submit(p_points int,p_mins int) returns void language plpgsql security definer set search_path=public as $$
declare me uuid:=auth.uid();
begin
  if me is null then raise exception 'denied'; end if;
  insert into weekly_scores(user_id,week,points,mins) values(me,lb_week(),least(greatest(coalesce(p_points,0),0),20000),least(greatest(coalesce(p_mins,0),0),4000))
  on conflict(user_id,week) do update set points=excluded.points,mins=excluded.mins,updated_at=now();
  if random()<0.02 then delete from weekly_scores where week<lb_week()-28; end if;
end $$;

create or replace function lb_clear() returns void language plpgsql security definer set search_path=public as $$
begin
  if auth.uid() is null then raise exception 'denied'; end if;
  delete from weekly_scores where user_id=auth.uid();
end $$;

create or replace function lb_board(p_room text) returns table(name text,points int,mins int,mine boolean)
language plpgsql security definer set search_path=public as $$
declare me uuid:=auth.uid(); t uuid;
begin
  if me is null or p_room !~ '^g:[0-9a-f-]{36}$' or not cm_can(p_room,me) then raise exception 'denied'; end if;
  t:=substr(p_room,3)::uuid;
  return query
    select coalesce(p.name,'طالب'),s.points,s.mins,(s.user_id=me)
    from weekly_scores s
    join group_members g on g.student_id=s.user_id and g.teacher_id=t
    left join community_profiles p on p.user_id=s.user_id
    where s.week=lb_week()
    order by s.points desc,s.mins desc limit 30;
end $$;

revoke all on function lb_submit(int,int),lb_clear(),lb_board(text),lb_week() from public,anon;
grant execute on function lb_submit(int,int),lb_clear(),lb_board(text),lb_week() to authenticated;
