-- Capas até 4 MB: o upload passa por uma Server Action e a Vercel corta pedidos acima de 4,5 MB
-- (ver docs/03-arquitetura/adr/ADR-003-ficheiros.md, risco R-07).
update storage.buckets
set file_size_limit = 4194304
where id = 'project-covers';
