# ADR-002 — Link mágico: gerado no servidor, validado na nossa página
> Projeto: GeniusFrela — Área do Cliente multi-serviço · Tarefa: [M3-02] · Issue: #27 · Versão: 1.0 · Data: 2026-11-24
> Depende de: `docs/02-modelagem/sequencia/sequencias.md` §1, `requisitos-funcionais.md` RF-30.5, `requisitos-nao-funcionais.md` RNF-301/RNF-309 · Perguntas/decisões usadas: Q-020, Q-059, Q-060, Q-064, D-011, D-023, D-032, D-067…D-070, D-076…D-079

**Estado:** Aceite · **Data:** 2026-11-24

## Contexto
O cliente chega pelo WhatsApp e não quer decorar senhas (PER-03, PER-04). O link tem de ser de **uso único**, válido **24 h** (D-023) e não pode ser gasto pela pré-visualização do WhatsApp (D-068). A M2-06 deixou três pontos para confirmar, que este spike resolveu.

## Spike (2026-11-24)
Script: [`../spikes/spike-link-magico.mjs`](../spikes/spike-link-magico.mjs), corrido contra o projeto Supabase de produção **só com o cliente de teste** (Q-064). Não envia emails; termina a sessão que cria.

| # | Pergunta | Resultado | Evidência |
|---|---|---|---|
| S1 | `auth.admin.generateLink({ type: "magiclink" })` devolve um `hashed_token` que `verifyOtp` aceita? | **Sim**, com `verifyOtp({ token_hash, type: "email" })` | Tipos de `@supabase/auth-js` 2.69.1 (`GenerateLinkProperties.hashed_token`, `VerifyTokenHashParams`) + execução: "link 2: ENTROU" |
| S2 | Um link novo invalida o anterior **no próprio Auth**? | **Sim** | "link 1 depois de gerar o 2: RECUSADO (403 otp_expired)" |
| S3 | O token é de uso único? | **Sim** | "link 2 outra vez: RECUSADO (403 otp_expired)" |
| S4 | Quanto dura a sessão no plano gratuito? | **Sem limite**: o *access token* dura 3600 s e renova-se com o *refresh token*; os limites de tempo e de inatividade só existem no plano Pro | docs "User sessions" + execução: `expires_in = 3600`, *refresh token* presente |
| S5 | **Armadilha encontrada:** com um utilizador de **email por confirmar**, `generateLink("magiclink")` devolve um link do tipo **`signup`**, e usá-lo confirma o email | 1.ª execução: `type=signup`. O cliente de teste tinha o email por confirmar e ficou confirmado: foi a única alteração | Os clientes criados pelo admin e pelo script já usam `email_confirm: true` (`lib/admin/actions.ts`, `scripts/supabase-admin.mjs`) |
| S6 | Há limite de frequência na API de admin? | Dois `generateLink` seguidos funcionaram; o limite de 5/hora (D-032) é **nosso**, em `access_links` | execução |

## Decisão
1. **Gerar no servidor** com `auth.admin.generateLink({ type: "magiclink", email })` numa Server Action com `requireAdminStrict`. O Supabase **não envia email** neste modo: o envio é nosso (WhatsApp `wa.me`, Copiar, ou Resend).
2. **O link é nosso:** `https://joao-pereira.dev/cliente/entrar?t=<hashed_token>`. Nunca se partilha o `action_link` do Supabase (D-067).
3. **GET mostra, POST entra** (D-068): o GET procura o `sha256(t)` em `access_links` e mostra "Olá, <nome> — Entrar"; só o POST do botão chama `verifyOtp({ token_hash: t, type: "email" })` com o cliente SSR (`@supabase/ssr`), que grava os cookies.
4. **Guarda dupla:** recusamos antes de chamar o Auth se o link em `access_links` estiver `usado`, `substituido` ou expirado; o Auth recusa sozinho os links antigos e já usados (S2, S3).
5. **Validação do tipo (D-077):** se `verification_type !== "magiclink"`, a ação **pára** e mostra ao admin "a conta tem o email por confirmar". Assim nunca se envia um link `signup` sem querer.
6. **Validade 24 h:** *Email OTP Expiration* = **86 400 s** em Auth → Providers → Email (o máximo, RNF-301). É uma **configuração do painel**, não do código (D-078).
7. **Sessão:** fica a do Supabase, sem limite no plano gratuito (S4). O cliente sai com "Sair". O admin pode cortar o acesso de um cliente apagando a conta ou mudando-lhe o email (Pro: limites de sessão, se um dia for preciso).
8. **A senha mantém-se como alternativa** (RF-30.55): `/cliente/login` com email + senha continua igual.

## Alternativas consideradas
| Alternativa | Porque não |
|---|---|
| `signInWithOtp` (o Supabase envia o email) | Não serve para o WhatsApp (o canal principal, D-011); o email do Supabase tem o limite do SMTP (30/h) e um modelo próprio |
| Partilhar o `action_link` do Supabase | Leva ao domínio do Supabase e volta com tokens no *fragment* (`#`), que o SSR não lê; e um GET gasta o token (pré-visualização do WhatsApp) |
| Código OTP de 6 dígitos (`email_otp`) | Obriga o cliente a copiar um código entre apps no telemóvel; pior para a PER-04 |
| Token próprio (tabela nossa + sessão criada à mão) | Reimplementar autenticação; mais risco de segurança sem ganho |

## Consequências
- **Positivas:** um toque no WhatsApp + um toque em "Entrar"; à prova de pré-visualizações; o token nunca fica guardado (só o SHA-256, D-069); um só link válido por cliente, garantido em duas camadas.
- **Negativas / riscos:**
  - **R-05 — browser do WhatsApp:** no Android, o WhatsApp pode abrir o link num browser interno; a sessão fica nesse browser e, se o cliente abrir o portal depois no Chrome, tem de pedir outro link ou usar a senha. **Testar num Android real** (RNF-207, M9-05 #78). Mitigação proposta: na primeira entrada, sugerir "Abrir no Chrome" e "Definir uma senha" (RF-30.54).
  - O admin tem de pôr o *Email OTP Expiration* em 86 400 s antes da release (checklist M10-01, #80). Por omissão, o Supabase usa 3600 s.
- **Testes (M5-12, #50):** gerar → entrar → reutilizar (recusado) → gerar 2 e usar o 1.º (recusado) → GET sem POST não gasta o token → utilizador por confirmar é bloqueado (D-077).

## RNF relacionados
RNF-207 (browser do WhatsApp) · RNF-301 (uso único, 24 h) · RNF-306 (segredos só no servidor) · RNF-309 (5 links/hora)
