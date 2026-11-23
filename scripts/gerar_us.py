"""Gera docs/01-requisitos/user-stories.md e rastreabilidade.md a partir de uma só fonte.

Uso: python3 scripts/gerar_us.py
As US vivem aqui; os RF (código, persona, prioridade) são lidos de requisitos-funcionais.md.
"""
import re
from collections import defaultdict
from pathlib import Path

DOCS = Path(__file__).resolve().parent.parent / "docs" / "01-requisitos"
RF_FILE = DOCS / "requisitos-funcionais.md"
HOJE = "2026-11-23"

# (código, grupo, título, persona, quero, para, dado, quando, então, [RF])
US = [
    # --- Comum: acesso e projeto ---
    ("US-001", "Comum", "Criar um projeto do tipo certo", "PER-01",
     "criar um projeto escolhendo Desenvolvimento, Académico ou Design",
     "que o portal mostre as fases e os blocos certos sem configuração manual",
     "estou no painel de admin a criar um projeto", "escolho Académico ou Design",
     "o campo do repositório GitHub desaparece e as 7 fases do serviço são criadas a partir do modelo",
     ["RF-30.01", "RF-30.02", "RF-30.03", "RF-10.01", "RF-20.01"]),
    ("US-002", "Comum", "Enviar o link mágico ao cliente", "PER-01",
     "gerar um link de acesso e enviá-lo pelo WhatsApp em 2 cliques",
     "o cliente entrar sem ter de criar ou lembrar-se de uma senha",
     "o cliente foi criado sem senha", "carrego em \"Gerar link\" e depois em \"Abrir no WhatsApp\"",
     "abre o `wa.me` com a mensagem e o link preenchidos; o link vale 24 h e só funciona uma vez",
     ["RF-30.50", "RF-30.51", "RF-30.52", "RF-30.56", "RF-30.57"]),
    ("US-003", "Comum", "Entrar pelo link mágico", "PER-04",
     "abrir o link que recebi no WhatsApp e ver logo o meu projeto",
     "não ter de instalar nada nem decorar senhas",
     "recebi um link válido", "toco no link no WhatsApp",
     "entro na Área do Cliente do meu projeto e continuo com sessão aberta no telemóvel; se o link já tiver sido usado ou expirado, vejo \"peça um novo\" com o botão do WhatsApp",
     ["RF-30.53", "RF-30.51", "RF-30.54", "RF-30.55"]),
    ("US-004", "Comum", "Ver onde está o projeto", "PER-03",
     "ver de relance a fase atual e o próximo passo",
     "saber se estou à espera da GeniusFrela ou se a ação é minha",
     "entrei na Área do Cliente", "abro a visão geral",
     "vejo a etiqueta do serviço, a barra de fases com o estado de cada uma e a fase atual com uma frase curta e um só botão de ação",
     ["RF-30.10", "RF-30.11", "RF-30.12", "RF-10.02", "RF-10.03", "RF-10.04", "RF-20.02", "RF-20.03", "RF-20.04", "RF-20.05"]),
    ("US-005", "Comum", "Avançar as fases", "PER-01",
     "avançar uma fase e escrever o próximo passo",
     "manter o cliente informado sem mensagens repetidas no WhatsApp",
     "um projeto Académico está na fase 4", "marco a fase como concluída ou \"a aguardar o cliente\"",
     "a barra de fases e o próximo passo do cliente mudam de imediato; uma fase pode ficar \"não aplicável\"",
     ["RF-30.04", "RF-10.33", "RF-20.62"]),
    ("US-006", "Comum", "Alternar entre projetos", "PER-04",
     "mudar entre o convite e a lona do mesmo evento",
     "acompanhar todas as peças com a mesma conta",
     "tenho 2 projetos de Design", "escolho o outro projeto no seletor",
     "vejo as fases, provas e pagamentos desse projeto",
     ["RF-30.13"]),
    ("US-007", "Comum", "Cancelar um projeto", "PER-01",
     "marcar um projeto como cancelado",
     "fechar o registo quando o cliente desiste",
     "o cliente desistiu depois de pagar o sinal", "marco o projeto como cancelado",
     "o projeto fica cancelado, o sinal continua registado como pago e não há reembolso",
     ["RF-30.06"]),
    ("US-008", "Comum", "Manter o Desenvolvimento como está", "PER-02",
     "continuar a ver as fases e tarefas vindas do GitHub",
     "não perder nada do que já usava",
     "sou cliente de um projeto Desenvolvimento", "abro o portal depois da v1.1",
     "as páginas atuais funcionam como antes e ganho os blocos Pagamentos, Aprovações e Ficheiros",
     ["RF-30.05"]),
    # --- Comum: pagamentos ---
    ("US-009", "Pagamentos", "Registar pagamentos", "PER-01",
     "registar sinal, restante e extras com valor e data limite",
     "ter prova do que foi combinado e pago",
     "o cliente aceitou o orçamento", "registo o sinal de 50% e marco-o como pago com a data",
     "o pagamento fica pago, a alteração fica no histórico e posso desfazê-la se me enganar",
     ["RF-30.20", "RF-30.22", "RF-10.20", "RF-20.20"]),
    ("US-010", "Pagamentos", "Ver os pagamentos", "PER-04",
     "ver quanto já paguei e quanto falta",
     "não ter surpresas no preço",
     "tenho um sinal pago e o restante pendente", "abro os pagamentos",
     "vejo total, pago, em falta e o estado de cada pagamento (pendente, pago, em atraso); não há botão de pagar no portal",
     ["RF-30.23", "RF-30.21"]),
    ("US-011", "Pagamentos", "Saber que um pagamento me trava", "PER-03",
     "ver como próximo passo o pagamento de que o trabalho depende",
     "perceber porque é que o trabalho não avança",
     "aceitei o orçamento mas o sinal está pendente", "abro a visão geral",
     "o próximo passo diz \"Pagar o sinal\" com o valor e a fase seguinte não avança",
     ["RF-30.24", "RF-10.23", "RF-20.23", "RF-10.62"]),
    # --- Comum: aprovações ---
    ("US-012", "Aprovações", "Aceitar o orçamento", "PER-03",
     "aceitar o orçamento no portal",
     "o trabalho poder começar e ficar registado o que aceitei",
     "o admin registou o orçamento", "carrego em \"Aceitar\"",
     "vejo antes a regra do sinal não reembolsável; o aceite fica com data, hora e autor",
     ["RF-10.21", "RF-10.22", "RF-20.21", "RF-20.22", "RF-30.30", "RF-30.32", "RF-30.06"]),
    ("US-013", "Aprovações", "Responder a uma aprovação", "PER-04",
     "aprovar ou pedir alterações com um comentário",
     "dar a minha decisão por escrito",
     "tenho uma aprovação pendente", "escolho \"Pedir alterações\" sem escrever nada",
     "o sistema pede o comentário; ao enviar, fica registado com a versão e o admin é avisado",
     ["RF-30.31", "RF-30.32", "RF-30.34", "RF-30.35"]),
    ("US-014", "Aprovações", "Reabrir uma aprovação", "PER-01",
     "reabrir uma aprovação com motivo",
     "corrigir um erro detetado depois de o cliente aprovar",
     "o cliente aprovou a arte e a produção ainda não começou", "reabro com o motivo \"nome errado\"",
     "a aprovação volta a pendente, o motivo fica no histórico; depois de a produção começar, a reabertura está bloqueada",
     ["RF-30.33", "RF-20.53", "RF-20.54"]),
    # --- Comum: ficheiros ---
    ("US-015", "Ficheiros", "Enviar referências", "PER-04",
     "enviar fotos e textos de referência no briefing",
     "a GeniusFrela ter tudo o que preciso num só sítio",
     "o projeto está na fase de briefing", "envio uma foto de 4 MB e um PDF de 12 MB",
     "a foto entra com barra de progresso; o PDF é recusado antes do envio com a indicação do limite de 10 MB",
     ["RF-30.41", "RF-30.42", "RF-10.12", "RF-20.13", "RF-10.51"]),
    ("US-016", "Ficheiros", "Carregar entregáveis e provas", "PER-01",
     "carregar um ficheiro como entregável, prova ou interno, numa fase",
     "o cliente ver só o que deve ver",
     "estou no projeto", "carrego uma nova versão de um entregável",
     "a versão anterior mantém-se e a nova passa a ser a atual",
     ["RF-30.40", "RF-30.43"]),
    ("US-017", "Ficheiros", "Descarregar com segurança", "PER-03",
     "descarregar os meus ficheiros",
     "ter os entregáveis sem que mais alguém os veja",
     "tenho um ficheiro disponível", "carrego em descarregar",
     "o download usa um link temporário; um ficheiro bloqueado por pagamento aparece mas não se descarrega",
     ["RF-30.44", "RF-30.45", "RF-30.46"]),
    ("US-018", "Ficheiros", "Gerir o espaço e a retenção", "PER-01",
     "ser avisado antes de os ficheiros de um projeto concluído serem apagados",
     "não esgotar o armazenamento gratuito sem perder nada importante",
     "um projeto foi concluído há 83 dias", "chega o aviso dos 7 dias",
     "posso adiar; sem ação, os ficheiros são apagados aos 90 dias e fica o registo; o cliente via até quando podia descarregar",
     ["RF-30.47", "RF-30.48", "RF-30.49"]),
    # --- Comum: mensagens ---
    ("US-019", "Mensagens", "Escrever à GeniusFrela", "PER-04",
     "enviar uma mensagem geral ou sobre uma fase",
     "tirar dúvidas sem perder o histórico",
     "são 22h", "envio uma mensagem sobre a fase de briefing",
     "a mensagem fica guardada e vejo \"Entraremos em contacto assim que o horário de abertura estiver disponível.\"",
     ["RF-30.60", "RF-30.63", "RF-10.13", "RF-20.14"]),
    ("US-020", "Mensagens", "Receber avisos por email", "PER-03",
     "ser avisado por email quando algo depende de mim ou fica pronto",
     "não ter de abrir o portal para saber se há novidades",
     "uma aprovação me foi pedida há 2 dias e não respondi", "passa o 2.º dia",
     "recebo um lembrete por email, sem dados sensíveis, com o link para o portal",
     ["RF-30.61", "RF-30.62", "RF-30.64", "RF-10.63", "RF-20.31", "RF-20.72"]),
    ("US-021", "Mensagens", "Ver o prazo ajustado", "PER-03",
     "ver a nova data de entrega quando o atraso foi meu",
     "saber com o que posso contar",
     "a fase esteve 3 dias \"a aguardar o cliente\"", "abro a visão geral",
     "a data de entrega aparece 3 dias depois, com o motivo \"à espera da sua aprovação desde DD/MM\"",
     ["RF-30.07"]),
    # --- Académico ---
    ("US-022", "Académico", "Registar a ficha do trabalho", "PER-01",
     "registar tema, tipo, nível, instituição, disciplina, normas, páginas e prazo",
     "ter tudo o que foi acordado num só sítio",
     "criei um projeto Académico", "preencho a ficha",
     "o cliente vê-a atrás de \"ver detalhes\"",
     ["RF-10.10", "RF-10.11"]),
    ("US-023", "Académico", "Ver o prazo em destaque", "PER-05",
     "ver quantos dias faltam para o prazo",
     "não entrar em pânico nem falhar a entrega",
     "faltam 36 horas", "abro a visão geral",
     "vejo a contagem em horas, na cor de \"a aguardar\"; depois do prazo fica a vermelho",
     ["RF-10.80", "RF-10.81", "RF-10.82", "RF-10.83"]),
    ("US-024", "Académico", "Aprovar o índice", "PER-03",
     "aprovar o índice proposto ou pedir alterações",
     "garantir a estrutura antes de o texto ser escrito",
     "o admin registou o índice", "peço alterações com um comentário",
     "a fase 3 volta a \"em curso\" e o admin é avisado; num trabalho curto, a fase pode ficar \"não aplicável\"",
     ["RF-10.30", "RF-10.31", "RF-10.32", "RF-10.33"]),
    ("US-025", "Académico", "Acompanhar os capítulos", "PER-03",
     "ver quantos capítulos já estão prontos",
     "saber em que ponto está o trabalho",
     "o admin marcou 3 de 5 capítulos como concluídos", "abro a fase de desenvolvimento",
     "vejo \"3 de 5 capítulos\" e a percentagem, sem acesso ao texto; sem capítulos, vejo só o progresso da fase",
     ["RF-10.40", "RF-10.41", "RF-10.42", "RF-10.43", "RF-10.50"]),
    ("US-026", "Académico", "Receber a entrega final", "PER-03",
     "descarregar o trabalho em PDF e Word",
     "entregá-lo na instituição",
     "o admin carregou os ficheiros finais e o restante está pendente", "abro a entrega",
     "vejo \"Entrega pronta, falta pagar o restante\" com o valor; depois de o admin registar o pagamento, descarrego os dois ficheiros e começa o prazo de ajustes",
     ["RF-10.60", "RF-10.61", "RF-10.62", "RF-10.64"]),
    ("US-027", "Académico", "Pedir um ajuste", "PER-05",
     "pedir um ajuste dentro do prazo",
     "corrigir o que o professor apontou",
     "restam 4 dos 7 dias de ajustes", "peço um ajuste com descrição e ficheiro",
     "o admin recebe o pedido e responde com uma nova versão, sem apagar a anterior; depois do prazo, o botão leva às mensagens",
     ["RF-10.70", "RF-10.71", "RF-10.72", "RF-10.73"]),
    ("US-028", "Académico", "Concluir o projeto", "PER-01",
     "que o projeto se conclua sozinho no fim do prazo de ajustes",
     "não ter de fechar projetos à mão",
     "o prazo de ajustes terminou sem pedidos abertos", "passa o último dia",
     "o projeto fica concluído e começa a contagem dos 90 dias dos ficheiros",
     ["RF-10.74"]),
    # --- Design ---
    ("US-029", "Design", "Registar a ficha técnica", "PER-01",
     "registar tipo de peça, medidas, material, quantidade, acabamento, textos e data do evento",
     "produzir sem ambiguidades",
     "criei um projeto Design", "indico que a peça é um convite digital sem impressão",
     "a ficha fica visível ao cliente atrás de \"ver detalhes\" e a fase de produção fica \"não aplicável\"",
     ["RF-20.10", "RF-20.11", "RF-20.12", "RF-20.62"]),
    ("US-030", "Design", "Ver a última prova em grande", "PER-04",
     "ver a prova mais recente logo ao abrir",
     "mostrá-la à família e decidir depressa",
     "o admin carregou a V2", "abro o projeto",
     "a V2 aparece em grande, em miniatura comprimida, com \"Ronda 1 de 2\" e um só botão (comentar ou aprovar)",
     ["RF-20.05", "RF-20.30", "RF-20.80", "RF-20.83"]),
    ("US-031", "Design", "Comparar versões", "PER-04",
     "comparar a V1 com a V2",
     "perceber o que mudou",
     "há duas versões", "abro a galeria e escolho comparar",
     "vejo as duas, uma por cima da outra no telemóvel, cada uma com a data e os comentários da ronda",
     ["RF-20.81", "RF-20.82", "RF-20.84"]),
    ("US-032", "Design", "Pedir uma ronda de revisão", "PER-04",
     "comentar a prova atual e pedir alterações",
     "ter a peça igual ao que imaginei",
     "estou na ronda 1 de 2", "envio um comentário com uma imagem",
     "gasto 1 ronda, o contador passa a \"Ronda 2 de 2\" e o admin responde com a V seguinte",
     ["RF-20.40", "RF-20.41", "RF-20.42"]),
    ("US-033", "Design", "Pedir uma ronda extra", "PER-04",
     "pedir mais uma ronda quando as incluídas acabaram",
     "continuar a afinar a peça sabendo quanto custa",
     "usei as 2 rondas incluídas", "peço uma ronda extra",
     "o admin indica o valor; a ronda só começa depois de eu aceitar o extra, que fica em Pagamentos",
     ["RF-20.43", "RF-30.25"]),
    ("US-034", "Design", "Aprovar a arte para produção", "PER-04",
     "aprovar a arte final",
     "a peça ir para produção sem erros",
     "estou satisfeita com a V3", "carrego em \"Aprovar arte para produção\"",
     "vejo o aviso de irreversibilidade e os nomes, a data e a quantidade da ficha; ao confirmar, fica registada a V3 e não há mais comentários",
     ["RF-20.44", "RF-20.50", "RF-20.51", "RF-20.52"]),
    ("US-035", "Design", "Acompanhar a produção", "PER-04",
     "ver se a peça já está a ser impressa",
     "planear o levantamento",
     "aprovei a arte mas o restante está pendente", "abro o projeto",
     "o próximo passo é \"Pagar o restante\"; depois de pago, vejo \"a imprimir\" e depois \"pronto\"",
     ["RF-20.60", "RF-20.61"]),
    ("US-036", "Design", "Levantar a peça", "PER-04",
     "saber quando e onde levanto a peça e descarregar os ficheiros digitais",
     "ter tudo pronto antes do evento",
     "a peça está pronta", "abro o projeto",
     "vejo a data e o local em destaque e, se houver, os ficheiros finais; o admin marca como entregue e o projeto conclui-se",
     ["RF-20.70", "RF-20.71", "RF-20.73", "RF-20.74"]),
]


def ler_rf():
    rf = {}
    for linha in RF_FILE.read_text().splitlines():
        m = re.match(r"\| (RF-\d\d\.\d\d) \| .*? \| (PER-[^|]*?) \| (Must|Should|Could|Won't) \|", linha)
        if m:
            rf[m.group(1)] = (m.group(2).strip(), m.group(3))
    return rf


def main():
    rf = ler_rf()
    usados = defaultdict(list)
    for u in US:
        for r in u[9]:
            assert r in rf, f"{u[0]} refere {r}, que não existe"
            usados[r].append(u[0])
    em_falta = sorted(set(rf) - set(usados))
    assert not em_falta, f"RF sem US: {em_falta}"

    def prio(refs):
        ps = {rf[r][1] for r in refs}
        return "Must" if "Must" in ps else ("Should" if "Should" in ps else "Could")

    out = [
        "# User stories — Área do Cliente multi-serviço",
        f"> Projeto: GeniusFrela — Área do Cliente multi-serviço · Tarefa: [M1-08] · Issue: #18 · Versão: 1.0 · Data: {HOJE}",
        "> Depende de: `requisitos-funcionais.md`, `regras-negocio.md`, `personas.md` · Perguntas/decisões usadas: Q-032…Q-035, D-038…D-041",
        "> Gerado por `scripts/gerar_us.py` — editar lá e voltar a correr.",
        "",
        "## Convenções",
        "- Uma US por **passo do fluxo** (D-041). Cada US liga a vários RF; todos os RF têm pelo menos uma US.",
        "- A prioridade da US é a do RF mais alto que cobre. Os RF Should dentro de uma US Must podem ficar para o fim da milestone.",
        "- As telas (TEL-NN) são ligadas na M4-02 (fluxo de telas).",
        "",
    ]
    grupo = None
    for (c, g, t, per, quero, para, dado, quando, entao, refs) in US:
        if g != grupo:
            out += [f"## {g}", ""]
            grupo = g
        out += [
            f"### {c} — {t}",
            f"Como **{per}**, quero {quero}, para {para}.",
            "",
            f"**Critérios:** Dado que {dado} · Quando {quando} · Então {entao}.",
            "",
            f"Prioridade: **{prio(refs)}** · RF: {', '.join(refs)} · Tela: — (M4-02)",
            "",
        ]
    (DOCS / "user-stories.md").write_text("\n".join(out))

    t = [
        "# Rastreabilidade — RF ↔ PER ↔ US ↔ TEL",
        f"> Projeto: GeniusFrela — Área do Cliente multi-serviço · Tarefa: [M1-08] · Issue: #18 · Versão: 1.0 · Data: {HOJE}",
        "> Gerado por `scripts/gerar_us.py`. A coluna TEL é preenchida na M4-02 e verificada na M9.",
        "",
        "| RF | Prioridade | Persona | US | TEL |",
        "|---|---|---|---|---|",
    ]
    for r in sorted(rf):
        t.append(f"| {r} | {rf[r][1]} | {rf[r][0]} | {', '.join(usados[r])} | — |")
    t += ["", f"Total: {len(rf)} RF · {len(US)} US · RF sem US: 0"]
    (DOCS / "rastreabilidade.md").write_text("\n".join(t) + "\n")
    print(f"{len(US)} US, {len(rf)} RF cobertos")


if __name__ == "__main__":
    main()
