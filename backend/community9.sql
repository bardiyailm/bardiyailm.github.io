-- المرحلة 9: قائمة المراكز الأولى في اختبار العقل الأسبوعي (تظهر لكل طلاب نفس الصف والمسار)
-- شغّل هذا الملف مرة واحدة في Supabase → SQL Editor.
create table if not exists mind_scores(
  user_id uuid not null,
  week date not null,
  grp text not null,
  name text not null,
  pct int not null,
  score int not null,
  total int not null,
  secs int not null default 0,
  at timestamptz not null default now(),
  primary key(user_id,week)
);
create index if not exists mind_scores_board on mind_scores(grp,week,pct desc,secs asc);
alter table mind_scores enable row level security;  -- بلا سياسات: الوصول عبر الدوال فقط

create or replace function mind_submit(p_week date,p_grp text,p_pct int,p_score int,p_total int,p_secs int) returns boolean
language plpgsql security definer set search_path=public as $$
declare me uuid:=auth.uid(); nm text;
begin
  if me is null then raise exception 'denied'; end if;
  if p_grp !~ '^[a-z]+\|[0-9]{1,2}\|[a-z]*$' then raise exception 'denied'; end if;
  if p_total<5 or p_total>400 or p_score<0 or p_score>p_total then raise exception 'denied'; end if;
  if extract(dow from p_week)<>5 then raise exception 'denied'; end if;  -- لا بد أن يكون يوم جمعة
  -- النافذة الواحدة للجميع: الجمعة 8 مساءً حتى 10 مساءً بتوقيت القاهرة (+10 دقائق مهلة للإرسال)
  if (now() at time zone 'Africa/Cairo') < (p_week + interval '20 hours')
     or (now() at time zone 'Africa/Cairo') > (p_week + interval '22 hours 10 minutes') then raise exception 'closed'; end if;
  if exists(select 1 from community_profiles where user_id=me and banned) then raise exception 'denied'; end if;
  select t.name into nm from teachers t where t.user_id=me and t.approved;
  if nm is null then select name into nm from community_profiles where user_id=me; end if;
  if nm is null then select username into nm from user_handles where user_id=me; end if;
  insert into mind_scores(user_id,week,grp,name,pct,score,total,secs)
    values(me,p_week,p_grp,left(coalesce(nm,'طالب'),40),least(greatest(p_pct,0),100),p_score,p_total,least(greatest(coalesce(p_secs,0),0),86400))
    on conflict(user_id,week) do nothing;
  if random()<0.02 then delete from mind_scores where week<current_date-60; end if;
  return true;
end $$;

create or replace function mind_board(p_grp text,p_week date) returns table(pos int,name text,pct int,score int,total int,secs int,mine boolean)
language plpgsql security definer set search_path=public as $$
declare me uuid:=auth.uid();
begin
  if me is null then raise exception 'denied'; end if;
  return query
    select (row_number() over(order by s.pct desc,s.secs asc,s.at asc))::int,s.name,s.pct,s.score,s.total,s.secs,(s.user_id=me)
    from mind_scores s where s.grp=p_grp and s.week=p_week
    order by s.pct desc,s.secs asc,s.at asc limit 20;
end $$;

create or replace function mind_rank(p_grp text,p_week date) returns table(pos int,players int)
language plpgsql security definer set search_path=public as $$
declare me uuid:=auth.uid();
begin
  if me is null then raise exception 'denied'; end if;
  return query
    select (select count(*)+1 from mind_scores x where x.grp=p_grp and x.week=p_week and (x.pct>s.pct or (x.pct=s.pct and x.secs<s.secs)))::int,
           (select count(*) from mind_scores y where y.grp=p_grp and y.week=p_week)::int
    from mind_scores s where s.grp=p_grp and s.week=p_week and s.user_id=me;
end $$;

revoke all on function mind_submit(date,text,int,int,int,int),mind_board(text,date),mind_rank(text,date) from public,anon;
grant execute on function mind_submit(date,text,int,int,int,int),mind_board(text,date),mind_rank(text,date) to authenticated;
