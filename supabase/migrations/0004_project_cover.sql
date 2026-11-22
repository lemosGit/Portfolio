-- Imagem de capa do projeto: aparece ao fundo do resumo, na área do cliente.
alter table public.projects
  add column if not exists cover_url text;

-- Bucket público (só leitura por URL); só o administrador envia, troca ou apaga.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('project-covers', 'project-covers', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
on conflict (id) do nothing;

create policy "admin envia capas" on storage.objects
  for insert to authenticated with check (bucket_id = 'project-covers' and public.is_admin());
create policy "admin altera capas" on storage.objects
  for update to authenticated using (bucket_id = 'project-covers' and public.is_admin());
create policy "admin apaga capas" on storage.objects
  for delete to authenticated using (bucket_id = 'project-covers' and public.is_admin());
