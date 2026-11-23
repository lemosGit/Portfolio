"""Cria as issues do backlog (scripts/tarefas.py). Idempotente; use --dry-run para ver o plano."""
import json, subprocess, sys
from collections import Counter
from tarefas import TASKS, MILESTONES

DRY = "--dry-run" in sys.argv


def gh(*a):
    return subprocess.run(["gh", *a], capture_output=True, text=True, check=True).stdout


def ms_key(code):
    return code.split("-")[0]


def labels_of(t):
    return [f"tipo: {t['t']}", *[f"area: {a}" for a in t["a"]], f"prioridade: {t['p']}", f"tamanho: {t['s']}", *t["extra"]]


def corpo(t, num):
    deps = ", ".join(f"#{num[d]} ({d})" if d in num else d for d in t["deps"]) or "—"
    ac = "\n".join(f"- [ ] {x}" for x in t["ac"]) or "- [ ] ..."
    return (f"## Objectivo\n{t['obj'] or t['title']}\n\n## Referências\n{t['refs'] or '—'}\n\n"
            f"Personas: {', '.join(t['per']) or '—'}\n\n## Critérios de aceitação\n{ac}\n\n"
            f"## Dependências\nDepende de: {deps}\n\n## Entregável\n{t['ent'] or '—'}\n")


# validação do backlog
codes = [t["code"] for t in TASKS]
assert len(codes) == len(set(codes)), "códigos repetidos"
for t in TASKS:
    assert ms_key(t["code"]) in MILESTONES, t["code"]
    assert t["s"] != "XL", f"{t['code']} é XL: dividir"
    assert t["ac"] and t["ent"], f"{t['code']} sem critérios ou entregável"
    for d in t["deps"]:
        assert d in codes, f"{t['code']} depende de {d}, que não existe"

if DRY:
    print(f"Total: {len(TASKS)} tarefas\n")
    for name, c in [("Milestone", Counter(MILESTONES[ms_key(t['code'])] for t in TASKS)),
                    ("Tipo", Counter(t["t"] for t in TASKS)), ("Prioridade", Counter(t["p"] for t in TASKS)),
                    ("Tamanho", Counter(t["s"] for t in TASKS)), ("Módulo", Counter(t["extra"][0] for t in TASKS))]:
        print(f"— {name}"); [print(f"   {v:>3}  {k}") for k, v in c.items()]
    print(f"\nGates do cliente: {', '.join(t['code'] for t in TASKS if 'gate: cliente' in t['extra'])}")
    print("\n— Todas as issues")
    for t in TASKS:
        print(f"  [{t['code']}] {t['title']}  ·  {', '.join(labels_of(t))}")
    sys.exit(0)

exist = {i["title"].split("]")[0][1:]: i["number"] for i in json.loads(
    gh("issue", "list", "--state", "all", "--limit", "1000", "--json", "number,title")) if i["title"].startswith("[")}
num = dict(exist)
for t in TASKS:  # 1.ª passagem: criar
    if t["code"] in num:
        continue
    title = f"[{t['code']}] {t['title']}"
    url = gh("issue", "create", "--title", title, "--body", corpo(t, num), "--milestone", MILESTONES[ms_key(t["code"])],
             *sum([["--label", l] for l in labels_of(t)], []))
    num[t["code"]] = int(url.strip().rsplit("/", 1)[1])
    print("Criada", title)
for t in TASKS:  # 2.ª passagem: ligar dependências por número
    if t["deps"]:
        gh("issue", "edit", str(num[t["code"]]), "--body", corpo(t, num))
print(f"Total: {len(TASKS)} tarefas")
