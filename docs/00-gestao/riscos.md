# Riscos
> Projeto: GeniusFrela — Área do Cliente multi-serviço · Versão: 1.0 · Data: 2026-11-23 · Rever no fim de cada milestone

| ID | Risco | Probabilidade | Impacto | Mitigação | Responsável | Estado |
|----|-------|---------------|---------|-----------|-------------|--------|
| R-01 | O plano Hobby da Vercel só permite uso não comercial e o portal serve clientes pagantes | Alta | Médio | Decidir na M3 (stack e custos): Vercel Pro ou outro alojamento | João | **Aceite** (Q-072, D-102): rever no fim de cada milestone e antes da release v1.1 |
| R-02 | Os 24 h do link mágico são o máximo do Supabase; um cliente pode abrir o link tarde | Média | Baixo | Ecrã de link expirado com botão para pedir outro pelo WhatsApp (RF-30.51) | João | Mitigado |
| R-03 | O Storage não tem backup (D-031); uma falha perde provas e entregáveis | Baixa | Alto | Originais no computador do admin (RNF-603); rever no gatilho RNF-505 | João | Aceite |
| R-04 | O Storage gratuito (1 GB) esgota-se com provas e PDFs | Média | Médio | Limites de upload (D-024), miniaturas WebP, retenção de 90 dias (D-025), gatilho a 80% (D-029) | João | Mitigado |
| R-05 | No Android, o WhatsApp pode abrir o link num browser interno; a sessão fica lá e o Chrome não a vê | Média | Médio | Testar num Android real (M9-05); sugerir "Abrir no Chrome" e "Definir uma senha" na 1.ª entrada | João | Aberto |
| R-06 | *Email OTP Expiration* fica nos 3600 s por omissão e o link expira em 1 h | Média | Baixo | Checklist da release (M10-01): pôr 86 400 s no painel (D-078) | João | Aberto |
| R-07 | Capas entre 4,5 e 5 MB falham em produção: a Server Action passa pela Vercel (limite 4,5 MB) e o bucket aceita 5 MB | Média | Baixo | Bucket `project-covers` baixado para 4 MB na produção (migração 0005, 2026-11-24); código no PR #103 | João | Mitigado (falta o merge do #103) |
| R-08 | O backup semanal cifrado **nunca correu**: faltam os segredos `SUPABASE_DB_URL` e `BACKUP_PASSPHRASE` no GitHub (1.ª execução falhou a 22 nov) | Alta | Alto | Exportação JSON manual antes de cada migração (D-118); o João define os 2 segredos e corre o workflow uma vez | João | Aberto |
| R-09 | Entre a migração 0006 (24 nov) e o deploy do PR da M5-04, mudar o estado de um projeto no admin para pausado (ou reabrir um entregue) falha com "Indique o motivo" | Certa | Baixo | Corrigido na M5-04 (D-123); fica resolvido com o merge e o deploy | João | Mitigado (falta o deploy) |
