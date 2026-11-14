-- المرحلة 7: إرسال PDF بسرعة: رفع مباشر إلى التخزين ثم نشر الرسالة (بلا مرور الملف عبر Edge Function ولا فحصه)
-- شغّل هذا الملف مرة واحدة في Supabase → SQL Editor.
update storage.buckets set file_size_limit=null where id='community';

-- يسمح للمستخدم المسجّل برفع PDF داخل مجلده فقط: <uid>/<uuid>.pdf
drop policy if exists "cm_pdf_upload" on storage.objects;
create policy "cm_pdf_upload" on storage.objects for insert to authenticated
  with check (bucket_id='community' and (storage.foldername(name))[1]=auth.uid()::text and lower(name) like '%.pdf');

create or replace function cm_post_file(p_room text,p_body text,p_file text,p_fname text) returns text language plpgsql security definer set search_path=public as $$
declare me uuid:=auth.uid(); fn text;
begin
  if me is null then raise exception 'denied'; end if;
  if p_file !~ ('^'||me::text||'/[0-9a-f-]{36}\.pdf$') then raise exception 'denied'; end if;
  if not exists(select 1 from storage.objects where bucket_id='community' and name=p_file) then raise exception 'denied'; end if;
  fn:=left(regexp_replace(coalesce(p_fname,'ملف.pdf'),'[\x01-\x1f<>"\\/]','','g'),80);
  return cm_post_core(me,p_room,p_body,null,p_file,coalesce(nullif(fn,''),'ملف.pdf'),true);
end $$;
revoke all on function cm_post_file(text,text,text,text) from public,anon;
grant execute on function cm_post_file(text,text,text,text) to authenticated;
