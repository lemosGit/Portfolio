-- Mapa próprio de milestones → fases, para projetos que não seguem o roteiro M0–M11.
-- Exemplo: '{"M3": 3}' põe a Arquitetura em Desenvolvimento. Null = mapa padrão.
alter table public.projects
  add column if not exists phase_map jsonb
  check (phase_map is null or jsonb_typeof(phase_map) = 'object');
