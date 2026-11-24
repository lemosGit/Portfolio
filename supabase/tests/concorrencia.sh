#!/usr/bin/env bash
# T3 (seguranca.md §6): o cliente aprova o mesmo pedido duas vezes AO MESMO TEMPO → 1 sucesso, 1 erro.
# Corre depois dos testes SQL (usa o pedido "prova" pendente do projeto RLS A, de 0090_rls.sql).
# Uso: chamado por scripts/db-test.sh com a função run() e o contentor já prontos.
set -uo pipefail
NAME="$1"
q() { docker exec -i "$NAME" psql -v ON_ERROR_STOP=1 -qtA -U postgres -d postgres "$@"; }

AP=$(q -c "select id from approvals where project_id = '40000000-0000-0000-0000-0000000000a1' and subject = 'prova' and status = 'pendente'")
[ -n "$AP" ] || { echo "T3: falta o pedido de teste"; exit 1; }

# A 1.ª sessão responde e fica 2 s com a transação aberta (o pedido fica trancado: FOR UPDATE).
# A 2.ª chega a meio, espera pelo cadeado e tem de receber "já foi respondido".
session() {
  q <<SQL
begin;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000a1"}', true);
set local role authenticated;
select respond_approval('$AP', 'aprovar') is not null;
select pg_sleep($1);
commit;
SQL
}
session 2 > /tmp/t3-a.log 2>&1 & A=$!
sleep 0.5
session 0 > /tmp/t3-b.log 2>&1 & B=$!
wait $A; RA=$?
wait $B; RB=$?

OK=$(( (RA == 0) + (RB == 0) ))
RESPOSTAS=$(q -c "select count(*) from approval_responses where approval_id = '$AP'")
if [ "$OK" -eq 1 ] && [ "$RESPOSTAS" -eq 1 ] && grep -q "já foi respondido" /tmp/t3-a.log /tmp/t3-b.log; then
  echo "✔ T3: duas aprovações em paralelo → 1 sucesso, 1 erro \"já foi respondido\""
else
  echo "✘ T3: sucessos=$OK respostas=$RESPOSTAS"; cat /tmp/t3-a.log /tmp/t3-b.log; exit 1
fi
