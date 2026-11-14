-- المرحلة 6: غلق وفتح دردشة المجموعة (للمعلم وللمشرف فقط)
-- شغّل هذا الملف مرة واحدة في Supabase → SQL Editor.
alter table teachers add column if not exists chat_locked boolean not null default false;

-- المعلم صاحب المجموعة أو مشرفها فقط
create or replace function cm_set_lock(p_teacher uuid,p_locked boolean) returns void language plpgsql security definer set search_path=public as $$
declare me uuid:=auth.uid();
begin
  if me is null or not (me=p_teacher or cm_is_sup(p_teacher,me)) then raise exception 'denied'; end if;
  update teachers set chat_locked=coalesce(p_locked,false) where user_id=p_teacher;
end $$;

-- حالة الغلق لغرفة مجموعة (لأعضائها فقط)
create or replace function cm_room_locked(p_room text) returns boolean language plpgsql security definer set search_path=public as $$
declare me uuid:=auth.uid();
begin
  if me is null or not cm_can(p_room,me) then return false; end if;
  if p_room !~ '^g:[0-9a-f-]{36}$' then return false; end if;
  return coalesce((select chat_locked from teachers where user_id=substr(p_room,3)::uuid),false);
end $$;

-- منع الإرسال في المجموعة المغلقة إلا من المعلم والمشرف (نفس cm_post_core في المرحلة 3 + فحص الغلق)
create or replace function cm_post_core(p_user uuid,p_room text,p_body text,p_image text,p_file text,p_fname text,p_scanned boolean) returns text language plpgsql security definer set search_path=public as $$
declare nm text; digs text; last timestamptz; hasurl boolean; gt uuid;
begin
  if not cm_can(p_room,p_user) then raise exception 'denied'; end if;
  if p_room ~ '^g:[0-9a-f-]{36}$' then
    gt:=substr(p_room,3)::uuid;
    if exists(select 1 from teachers where user_id=gt and chat_locked) and not (gt=p_user or cm_is_sup(gt,p_user)) then raise exception 'locked'; end if;
  end if;
  p_body:=btrim(coalesce(p_body,''));
  if char_length(p_body)>400 or (char_length(p_body)<1 and p_image is null and p_file is null) then raise exception 'bad_len'; end if;
  digs:=regexp_replace(translate(p_body,'٠١٢٣٤٥٦٧٨٩۰۱۲۳۴۵۶۷۸۹','01234567890123456789'),'\D','','g');
  hasurl:=p_body ~* '(https?:|www\.|\.com|\.net|\.org|\.me/|t\.me|wa\.me)';
  if char_length(digs)>=8 or p_body ~* '(@[a-z0-9_]{3,}|whatsapp|واتس|تليجرام|تيليجرام|انستجرام|انستغرام)' then raise exception 'blocked'; end if;
  if (hasurl or p_image is not null or p_file is not null) and not p_scanned then raise exception 'needs_scan'; end if;
  if cm_profane(p_body) then
    update community_profiles set strikes=strikes+1,banned=(strikes+1>=3) where user_id=p_user;
    return case when exists(select 1 from community_profiles where user_id=p_user and banned) then 'banned' else 'profane' end;
  end if;
  select max(created_at) into last from messages where user_id=p_user;
  if last is not null and now()-last<interval '2 seconds' then raise exception 'slow'; end if;
  if (select count(*) from messages where user_id=p_user and created_at>now()-interval '10 minutes')>=100
     or (select count(*) from messages where user_id=p_user and created_at>now()-interval '1 day')>=600 then raise exception 'slow'; end if;
  select t.name into nm from teachers t where t.user_id=p_user and t.approved;
  if nm is null then select name into nm from community_profiles where user_id=p_user; end if;
  if nm is null then select username into nm from user_handles where user_id=p_user; end if;
  if nm is null then raise exception 'no_profile'; end if;
  insert into messages(room,user_id,name,body,image,file,fname) values(p_room,p_user,nm,p_body,p_image,p_file,left(p_fname,80));
  if random()<0.01 then
    delete from messages where created_at<now()-interval '30 days';
    delete from cm_attempts where at<now()-interval '2 days';
  end if;
  return '';
end $$;

revoke all on function cm_set_lock(uuid,boolean),cm_room_locked(text) from public,anon;
grant execute on function cm_set_lock(uuid,boolean),cm_room_locked(text) to authenticated;
