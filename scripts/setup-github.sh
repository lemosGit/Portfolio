#!/usr/bin/env bash
# Labels e milestones do roteiro multi-serviço (idempotente). Não apaga labels existentes (D-008).
set -e
cd "$(dirname "$0")"
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
LABELS=(
  "tipo: feature|1D76DB|Nova funcionalidade" "tipo: docs|0075CA|Documentação / artefacto"
  "tipo: bug|D73A4A|Erro a corrigir" "tipo: chore|C5DEF5|Configuração e manutenção"
  "tipo: refactor|BFD4F2|Melhoria sem mudar comportamento" "tipo: test|5319E7|Testes"
  "tipo: spike|F9D0C4|Investigação com tempo limitado" "tipo: entrega-cliente|0E8A16|Demo, release ou passagem ao cliente"
  "area: gestão|EDEDED|Processo, quadro, comercial" "area: requisitos|FEF2C0|Levantamento e especificação"
  "area: modelagem|FBCA04|UML, MER, dicionário" "area: arquitetura|E99695|Stack, ADRs, desenho técnico"
  "area: ux-ui|F9A8D4|Wireframes, protótipos" "area: backend|0E8A16|API / server actions" "area: database|006B75|Base de dados"
  "area: frontend|7057FF|Web" "area: devops|000000|CI/CD, infra, deploy"
  "area: qa|B60205|Qualidade e testes" "area: suporte|5CC8E6|Pós-entrega"
  "prioridade: must|B60205|MoSCoW — obrigatório" "prioridade: should|D93F0B|MoSCoW — importante"
  "prioridade: could|FBCA04|MoSCoW — desejável" "prioridade: wont|CCCCCC|MoSCoW — fora do âmbito"
  "estado: bloqueado|000000|Depende de algo não resolvido" "estado: precisa-info|D876E3|Falta informação"
  "estado: em-revisão|0052CC|Aguarda revisão"
  "tamanho: XS|C2E0C6|< 2 horas" "tamanho: S|A2EEEF|Meio dia" "tamanho: M|7DD3FC|1-2 dias"
  "tamanho: L|3B82F6|3-5 dias" "tamanho: XL|1E3A8A|> 1 semana — dividir"
  "gate: cliente|9D7CF8|Exige aprovação formal do cliente" "entrega: imagem|0E8A16|Exige PNG/SVG em docs/"
  "modulo: comum|7C3AED|Fundação partilhada pelos 3 serviços" "modulo: academico|F59E0B|Serviço Académico"
  "modulo: design|EC4899|Serviço Design" "modulo: desenvolvimento|22D3EE|Serviço Desenvolvimento (Tech)"
)
for e in "${LABELS[@]}"; do IFS='|' read -r n c d <<< "$e"; gh label create "$n" --color "$c" --description "$d" --force >/dev/null; echo "Label: $n"; done
python3 -c 'from tarefas import MILESTONES as M, MILESTONE_DESC as D
for k,v in M.items(): print(v+"|"+D[k])' | while IFS='|' read -r t d; do
  if gh api "repos/$REPO/milestones?state=all&per_page=100" -q '.[].title' | grep -Fxq "$t"; then echo "Já existe: $t"
  else gh api "repos/$REPO/milestones" -f title="$t" -f description="$d" -f state=open >/dev/null && echo "Criada: $t"; fi
done
echo "✅ Labels e milestones prontos em $REPO."
