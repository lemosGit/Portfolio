# Ligar o Portal do Cliente ao Supabase (plano gratuito)

Sem as variáveis do Supabase, o portal funciona em **modo de demonstração** com dados de exemplo. Depois destes passos, passa a usar contas e dados reais.

## 1. Criar o projeto no Supabase

1. Em [supabase.com](https://supabase.com), crie um projeto no plano **Free**.
2. Escolha a região mais próxima dos clientes (por exemplo, *West EU* para Angola) e guarde a senha da base de dados num gestor de senhas.
3. **Authentication → Sign In / Providers → Email:** desligue *Allow new users to sign up*. As contas são criadas só por si.

## 2. Criar as tabelas

**SQL Editor → New query** → cole o conteúdo de [`supabase/migrations/0001_portal.sql`](../supabase/migrations/0001_portal.sql) → **Run**. Repita, por ordem, com [`0002_phase_map.sql`](../supabase/migrations/0002_phase_map.sql) e [`0003_harden_functions.sql`](../supabase/migrations/0003_harden_functions.sql).

O ficheiro cria 5 tabelas (`clients`, `projects`, `demo_links`, `meetings`, `feedback`) e as regras de segurança. Cada cliente só consegue ver e escrever no seu próprio projeto.

## 3. Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha com os valores de **Project Settings → API Keys** e do botão **Connect**:

| Variável | Onde usar | É segredo? |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `.env.local` e Vercel | Não |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `.env.local` e Vercel | Não (protegida pelas regras RLS) |
| `SUPABASE_SECRET_KEY` | **só** `.env.local` (script) | **Sim — nunca na Vercel nem no Git** |
| `ADMIN_EMAIL` | `.env.local` | Não |
| `CRON_SECRET` | Vercel | Sim |
| `GITHUB_TOKEN` | `.env.local` e Vercel | **Sim** |
| `GITHUB_WEBHOOK_SECRET` | `.env.local` e Vercel | **Sim** |

## 4. A sua conta de administrador

1. **Authentication → Users → Add user**, com o seu email e uma senha forte, e *Auto confirm* ligado.
2. `npm run portal -- admin --email o-seu-email@exemplo.com`

## 5. Criar um cliente

```bash
npm run portal -- cliente --nome "Alex Martins" --email alex@empresa.ao \
  --projeto "Nova App Mobile" --empresa "Nova Mobilidade" --repo lemosGit/nova-app \
  --entrega 2026-12-20
```

O script mostra uma **senha temporária**. Envie-a ao cliente por um canal privado. No primeiro acesso, o portal obriga-o a definir uma senha nova.

Outros comandos (ver `npm run portal -- ajuda`):

```bash
npm run portal -- demo --projeto nova-app-mobile --tipo web --url https://nova-app.vercel.app --versao 0.9.0
npm run portal -- demo --projeto nova-app-mobile --tipo android --url https://expo.dev/... --versao 0.9.0
npm run portal -- reuniao --projeto nova-app-mobile --titulo "Revisão do Sprint 04" \
  --inicio "2026-11-25 14:30" --fim "2026-11-25 15:15" --link https://meet.google.com/... --pauta "Leitor QR; Relatórios"
npm run portal -- mensagens --projeto nova-app-mobile
npm run portal -- responder --projeto nova-app-mobile --mensagem "Já está corrigido na 0.9.1."
```

## 6. Evitar a pausa do plano gratuito

Um projeto Free sem atividade durante uma semana é **pausado**. Os dados não são apagados, mas o portal deixa de funcionar até o reativar.

- O `vercel.json` agenda uma chamada diária a `/api/keepalive`, que faz uma consulta leve à base de dados.
- Na Vercel, defina `CRON_SECRET`. A Vercel envia-o automaticamente ao cron, e sem ele a rota responde 401.
- Para verificar: **Vercel → Settings → Cron Jobs → Run**. A resposta deve ser `{"ok":true,...}`.

## 7. Cópia de segurança semanal

O workflow [`.github/workflows/backup-supabase.yml`](../.github/workflows/backup-supabase.yml) exporta a base de dados todos os domingos. Como o repositório é **público**, o ficheiro é **cifrado** antes de ser guardado.

1. **GitHub → Settings → Secrets and variables → Actions:**
   - `SUPABASE_DB_URL`: Supabase → **Connect → Session pooler** (os servidores do GitHub não suportam a ligação direta por IPv6). Substitua `[YOUR-PASSWORD]` pela senha da base de dados.
   - `BACKUP_PASSPHRASE`: uma frase longa e aleatória. **Guarde-a também fora do GitHub**, porque sem ela o backup não abre.
2. Teste já: **Actions → Backup Supabase → Run workflow**.
3. Restaurar: descarregue o artefacto e execute
   `gpg --decrypt backup-AAAA-MM-DD.sql.gz.gpg | gunzip | psql "<ligação>"`.

Os artefactos ficam guardados 90 dias.

## 8. Ligar o GitHub (fases e tarefas)

1. **Token** — GitHub → Settings → Developer settings → **Fine-grained tokens** → *Generate new token*:
   - *Resource owner*: `lemosGit` · *Repository access*: **Only select repositories** (ex.: `candongueiro_pay`).
   - *Permissions → Repository*: **Issues: Read-only** (o *Metadata: Read-only* é automático).
   - Guarde-o como `GITHUB_TOKEN` no `.env.local` e na Vercel. Ao aceitar um cliente novo, edite o token e acrescente o repositório.
2. **Label** — em cada repositório, crie `cliente: visível` e aplique-a às issues que o cliente deve ver:
   ```bash
   gh label create "cliente: visível" --repo lemosGit/candongueiro_pay --color 8B6CFF \
     --description "Aparece no Portal do Cliente"
   gh issue edit 84 --repo lemosGit/candongueiro_pay --add-label "cliente: visível"
   ```
   Enquanto nenhuma issue tiver esta label, o portal mostra as `tipo: feature` e `tipo: bug` (regra provisória).
3. **Webhook** (atualização imediata) — repositório → Settings → Webhooks → *Add webhook*:
   - Payload URL `https://joao-pereira.dev/api/github/webhook` · Content type `application/json`
   - Secret = `GITHUB_WEBHOOK_SECRET` · Eventos: **Issues**, **Milestones**, **Labels**.
   - Sem webhook, o portal atualiza sozinho a cada 10 minutos.
4. **Pré-visualizar sem Supabase** — no `.env.local`, `PORTAL_DEMO_REPO=lemosGit/candongueiro_pay` mostra as fases reais desse repositório dentro do projeto de demonstração.

**Fases:** os milestones `M0`–`M11` agrupam-se nas 6 fases (ver §4.2 da especificação). Para um projeto com outro agrupamento:
```sql
update projects set phase_map = '{"M3": 3}' where slug = 'candongueiro-pay';
```

## O que ainda é de exemplo

- **Painel `/admin`**: até existir, use o `npm run portal`.
- **Vários projetos por cliente**: o portal mostra o projeto mais recente.
