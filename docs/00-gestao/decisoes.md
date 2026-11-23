# Decisões
> Projeto: GeniusFrela — Área do Cliente multi-serviço · Versão: 1.0 · Data: 2026-11-23

| ID | Data | Decisão | Origem | Alternativas | Estado |
|----|------|---------|--------|--------------|--------|
| D-001 | 2026-11-23 | Fases de Académico/Design guardadas no Supabase como dados por `service_type`; o Desenvolvimento mantém os milestones do GitHub | Q-001 | Tudo na BD, Tech incluído; fases fixas no código | Aprovada |
| D-002 | 2026-11-23 | Pagamentos, Aprovações, Ficheiros e Link mágico construídos uma vez (M5) e usados pelos 3 serviços | Q-002 | Só 3 blocos; nenhum | Aprovada |
| D-003 | 2026-11-23 | Ordem: fundação (M5) → Académico (M6) → Design (M7) | Q-003 | Design primeiro; em paralelo | Aprovada |
| D-004 | 2026-11-23 | Base visual atual mantida; `--accent`/`--accent-2` por serviço (Dev #22D3EE/#3B82F6 · Académico #F59E0B/#1E3A8A · Design #EC4899/#F97316) | Q-004 | Migrar para #0B0F1A/#7C3AED | Aprovada |
| D-005 | 2026-11-23 | Layout Tech mantém as 6 fases já implementadas (o documento lista 7); não se altera neste roteiro | Assumido | Passar o Tech para 7 fases | Assumida — confirmar no G1 |
| D-006 | 2026-11-23 | M6 e M7 são fatias verticais por módulo (BD + admin + cliente), não "backend" e "web" separados | Assumido | Divisão por camada da metodologia | Assumida |
| D-007 | 2026-11-23 | Sem branch `develop`: o repositório já trabalha com `feature/*` → PR → `main` | Assumido (histórico de PRs #1–#10) | Criar `develop` | Assumida |
| D-008 | 2026-11-23 | As labels por omissão do GitHub (bug, enhancement…) mantêm-se; acrescentam-se as da metodologia + `modulo: *` | Assumido | Apagá-las | Assumida |
| D-009 | 2026-11-23 | Pagamentos só mostrados ao cliente; o admin regista sinal/restante/extra; sem gateway | Q-005 | Comprovativo enviado pelo cliente; pagamento online | Aprovada |
| D-010 | 2026-11-23 | O cliente carrega ficheiros de referência nas fases de briefing e revisão (limite de tamanho e tipos) | Q-006 | Só o admin envia | Aprovada |
| D-011 | 2026-11-23 | Link mágico partilhado manualmente (Copiar / wa.me) + email via Resend; sem WhatsApp Business API | Q-007 | WhatsApp API; só email do Supabase | Aprovada |
