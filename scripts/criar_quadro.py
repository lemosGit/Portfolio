"""Cria o quadro (GitHub Projects v2) e adiciona as issues do backlog. Idempotente."""
import json, subprocess
from tarefas import TASKS

TITLE = "GeniusFrela — Área do Cliente multi-serviço"


def gh(*a):
    return subprocess.run(["gh", *a], capture_output=True, text=True, check=True).stdout


owner = gh("repo", "view", "--json", "owner", "-q", ".owner.login").strip()
projects = json.loads(gh("project", "list", "--owner", owner, "--format", "json", "--limit", "100"))["projects"]
proj = next((p for p in projects if p["title"] == TITLE), None)
if not proj:
    proj = json.loads(gh("project", "create", "--owner", owner, "--title", TITLE, "--format", "json"))
    print("Quadro criado:", proj["url"])
n = str(proj["number"])
repo = gh("repo", "view", "--json", "nameWithOwner", "-q", ".nameWithOwner").strip()
gh("project", "link", n, "--owner", owner, "--repo", repo)
codes = {t["code"] for t in TASKS}
issues = json.loads(gh("issue", "list", "--state", "all", "--limit", "1000", "--json", "number,title,url"))
added = 0
for i in issues:
    if i["title"].startswith("[") and i["title"][1:].split("]")[0] in codes:
        gh("project", "item-add", n, "--owner", owner, "--url", i["url"]); added += 1
print(f"{added} issues no quadro: {proj['url']}")
