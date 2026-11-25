/**
 * Modelos dos avisos ao cliente. HTML simples com estilos inline (compatível com os
 * clientes de email) e versão em texto. Todo o conteúdo variável passa por esc().
 */
import { longDate, time } from "@/lib/portal/format";
import { SITE_URL } from "./send";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

const firstName = (name: string) => name.trim().split(/\s+/)[0] ?? name;

function layout({ preheader, title, body, cta }: { preheader: string; title: string; body: string; cta: { href: string; label: string } }) {
  return `<!doctype html>
<html lang="pt"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title></head>
<body style="margin:0;background:#f4f2fb;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1c1830">
<span style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;border:1px solid #e6e1f7">
<tr><td style="padding:28px 32px 0"><table role="presentation" cellpadding="0" cellspacing="0"><tr>
<td style="padding-right:12px;vertical-align:middle"><img src="${SITE_URL}/brand/mark-96.png" width="40" height="40" alt="" style="display:block;border:0;border-radius:10px"></td>
<td style="vertical-align:middle"><div style="font-size:18px;font-weight:700;letter-spacing:-.01em;color:#1c1830">Genius<span style="color:#7c8cf8">Frela</span></div>
<div style="font-size:10px;font-weight:600;letter-spacing:.18em;color:#8a85a3;text-transform:uppercase">Área do cliente</div></td>
</tr></table></td></tr>
<tr><td style="padding:12px 32px 0"><h1 style="margin:0;font-size:22px;line-height:1.3;color:#1c1830">${esc(title)}</h1></td></tr>
<tr><td style="padding:16px 32px 0;font-size:15px;line-height:1.6;color:#3d3854">${body}</td></tr>
<tr><td style="padding:24px 32px 32px"><a href="${esc(cta.href)}" style="display:inline-block;background:#6d4cff;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:12px 20px;border-radius:10px">${esc(cta.label)}</a></td></tr>
</table>
<p style="max-width:560px;margin:16px auto 0;font-size:12px;line-height:1.5;color:#8a85a3">Recebe este email porque tem um projeto em acompanhamento na GeniusFrela. Pode responder diretamente a este email.</p>
</td></tr></table></body></html>`;
}

export function replyEmail(o: { clientName: string; projectName: string; body: string }) {
  const href = `${SITE_URL}/cliente/mensagens`;
  const excerpt = o.body.length > 600 ? `${o.body.slice(0, 600)}…` : o.body;
  return {
    subject: `Nova resposta sobre ${o.projectName}`,
    html: layout({
      preheader: excerpt.slice(0, 120),
      title: `Olá ${firstName(o.clientName)}, tem uma resposta nova`,
      body: `<p style="margin:0 0 12px">O João respondeu à sua mensagem sobre <strong>${esc(o.projectName)}</strong>:</p>
<blockquote style="margin:0;padding:12px 16px;border-left:3px solid #8b6cff;background:#f7f5ff;border-radius:8px;white-space:pre-wrap">${esc(excerpt)}</blockquote>`,
      cta: { href, label: "Ver a conversa" },
    }),
    text: `Olá ${firstName(o.clientName)},\n\nO João respondeu à sua mensagem sobre ${o.projectName}:\n\n${excerpt}\n\nVer a conversa: ${href}`,
  };
}

export function meetingEmail(o: {
  clientName: string;
  projectName: string;
  title: string;
  startsAt: string;
  endsAt: string;
  callUrl: string;
  agenda: string[];
  updated: boolean;
}) {
  const when = `${longDate(o.startsAt)}, ${time(o.startsAt)}–${time(o.endsAt)} (hora de Luanda)`;
  const agendaHtml = o.agenda.length
    ? `<p style="margin:12px 0 4px"><strong>Pauta</strong></p><ul style="margin:0;padding-left:20px">${o.agenda.map((a) => `<li>${esc(a)}</li>`).join("")}</ul>`
    : "";
  const verb = o.updated ? "foi alterada" : "foi marcada";
  return {
    subject: `${o.updated ? "Reunião alterada" : "Reunião marcada"}: ${o.title}`,
    html: layout({
      preheader: `${o.title} · ${when}`,
      title: `${o.updated ? "Reunião alterada" : "Reunião marcada"}`,
      body: `<p style="margin:0 0 12px">Olá ${esc(firstName(o.clientName))}, a reunião <strong>${esc(o.title)}</strong> sobre ${esc(o.projectName)} ${verb}.</p>
<p style="margin:0"><strong>Quando:</strong> ${esc(when)}</p>${agendaHtml}`,
      cta: { href: o.callUrl, label: "Entrar na chamada" },
    }),
    text: `Olá ${firstName(o.clientName)},\n\nA reunião "${o.title}" sobre ${o.projectName} ${verb}.\nQuando: ${when}\n${o.agenda.length ? `\nPauta:\n${o.agenda.map((a) => `- ${a}`).join("\n")}\n` : ""}\nEntrar na chamada: ${o.callUrl}\nAgenda no portal: ${SITE_URL}/cliente/agenda`,
  };
}

const KIND = { web: "web", android: "Android", ios: "iOS" } as const;

export function demoEmail(o: { clientName: string; projectName: string; kind: keyof typeof KIND; version: string; notes: string }) {
  const href = `${SITE_URL}/cliente/entregas`;
  const label = `${KIND[o.kind]} v${o.version}`;
  return {
    subject: `Nova versão de ${o.projectName}: ${label}`,
    html: layout({
      preheader: `A versão ${label} já está disponível para testar.`,
      title: `Versão ${label} disponível`,
      body: `<p style="margin:0 0 12px">Olá ${esc(firstName(o.clientName))}, há uma versão nova de <strong>${esc(o.projectName)}</strong> para testar.</p>${
        o.notes ? `<p style="margin:0"><strong>O que mudou:</strong> ${esc(o.notes)}</p>` : ""
      }${o.kind !== "web" ? `<p style="margin:12px 0 0">No portal encontra o QR code para instalar no telemóvel.</p>` : ""}`,
      cta: { href, label: "Abrir as entregas" },
    }),
    text: `Olá ${firstName(o.clientName)},\n\nHá uma versão nova de ${o.projectName} para testar: ${label}.${o.notes ? `\nO que mudou: ${o.notes}` : ""}\n\nAbrir as entregas: ${href}`,
  };
}

/** Frase para o cliente sobre o novo estado de uma fase (M5-08). */
const PHASE_SENTENCE: Record<string, string> = {
  em_curso: "começou",
  aguarda_cliente: "está a aguardar uma ação sua",
  atrasada: "está atrasada",
  concluida: "foi concluída",
  por_iniciar: "voltou a ficar por iniciar",
  nao_aplicavel: "não se aplica a este projeto",
  atualizada: "foi atualizada",
};

export function phaseEmail(o: {
  clientName: string;
  projectName: string;
  changes: { name: string; to: string }[];
  nextStep?: string | null;
  note?: string | null;
}) {
  const href = `${SITE_URL}/cliente`;
  const lines = o.changes.map((c) => `A fase “${c.name}” ${PHASE_SENTENCE[c.to] ?? "mudou de estado"}.`);
  const waiting = o.changes.some((c) => c.to === "aguarda_cliente");
  const extra = [o.note && `Nota: ${o.note}`, o.nextStep && `Próximo passo: ${o.nextStep}`].filter(Boolean) as string[];
  return {
    subject: `${o.projectName}: ${lines[lines.length - 1].replace(/\.$/, "")}`,
    html: layout({
      preheader: lines.join(" "),
      title: waiting ? "Precisamos de si" : "Novidades no seu projeto",
      body: `<p style="margin:0 0 12px">Olá ${esc(firstName(o.clientName))}, há novidades em <strong>${esc(o.projectName)}</strong>:</p>
<ul style="margin:0 0 12px;padding-left:20px">${lines.map((l) => `<li>${esc(l)}</li>`).join("")}</ul>${extra
        .map((e) => `<p style="margin:0 0 8px">${esc(e)}</p>`)
        .join("")}`,
      cta: { href, label: "Ver o projeto" },
    }),
    text: `Olá ${firstName(o.clientName)},\n\nHá novidades em ${o.projectName}:\n${lines.map((l) => `- ${l}`).join("\n")}\n${extra.length ? `\n${extra.join("\n")}\n` : ""}\nVer o projeto: ${href}`,
  };
}

/** Pedido de aprovação ao cliente (M5-10). */
export function approvalRequestEmail(o: { clientName: string; projectName: string; title: string; message?: string | null }) {
  const href = `${SITE_URL}/cliente`;
  return {
    subject: `${o.projectName}: precisamos da sua aprovação (${o.title})`,
    html: layout({
      preheader: `Veja e aprove: ${o.title}.`,
      title: "Precisamos da sua aprovação",
      body: `<p style="margin:0 0 12px">Olá ${esc(firstName(o.clientName))}, em <strong>${esc(o.projectName)}</strong> há um pedido à sua espera: <strong>${esc(o.title)}</strong>.</p>${
        o.message ? `<p style="margin:0 0 12px">${esc(o.message)}</p>` : ""
      }<p style="margin:0">Pode aprovar ou pedir alterações na Área do Cliente.</p>`,
      cta: { href, label: "Ver o pedido" },
    }),
    text: `Olá ${firstName(o.clientName)},\n\nEm ${o.projectName} há um pedido à sua espera: ${o.title}.${o.message ? `\n${o.message}` : ""}\n\nAprovar ou pedir alterações: ${href}`,
  };
}

/** Aviso ao João quando o cliente responde (RF-30.35). */
export function approvalAnsweredEmail(o: { clientName: string; projectName: string; projectId: string; title: string; approved: boolean; comment?: string | null }) {
  const href = `${SITE_URL}/admin/projetos/${o.projectId}/aprovacoes`;
  const verb = o.approved ? "aprovou" : "pediu alterações em";
  return {
    subject: `${o.clientName} ${verb} ${o.title} (${o.projectName})`,
    html: layout({
      preheader: `${o.clientName} ${verb} ${o.title}.`,
      title: o.approved ? "Aprovação recebida" : "Alterações pedidas",
      body: `<p style="margin:0 0 12px"><strong>${esc(o.clientName)}</strong> ${verb} <strong>${esc(o.title)}</strong> em ${esc(o.projectName)}.</p>${
        o.comment
          ? `<blockquote style="margin:0;padding:12px 16px;border-left:3px solid #8b6cff;background:#f7f5ff;border-radius:8px;white-space:pre-wrap">${esc(o.comment)}</blockquote>`
          : ""
      }`,
      cta: { href, label: "Abrir as aprovações" },
    }),
    text: `${o.clientName} ${verb} ${o.title} em ${o.projectName}.${o.comment ? `\n\n${o.comment}` : ""}\n\n${href}`,
  };
}

/** Pagamento registado ou confirmado (M5-11). */
export function paymentEmail(o: { clientName: string; projectName: string; description: string; amount: string; paid: boolean; dueOn?: string | null }) {
  const href = `${SITE_URL}/cliente`;
  const title = o.paid ? "Pagamento recebido" : "Pagamento registado";
  const line = o.paid
    ? `Recebemos o pagamento de <strong>${esc(o.amount)}</strong> (${esc(o.description)}). Obrigado!`
    : `Registámos o pagamento <strong>${esc(o.description)}</strong>: ${esc(o.amount)}${o.dueOn ? `, até ${esc(longDate(o.dueOn))}` : ""}.`;
  return {
    subject: `${o.projectName}: ${title.toLowerCase()} (${o.description})`,
    html: layout({
      preheader: `${o.description}: ${o.amount}`,
      title,
      body: `<p style="margin:0 0 12px">Olá ${esc(firstName(o.clientName))},</p><p style="margin:0">${line}</p>`,
      cta: { href, label: "Ver os pagamentos" },
    }),
    text: `Olá ${firstName(o.clientName)},\n\n${o.paid ? `Recebemos o pagamento de ${o.amount} (${o.description}). Obrigado!` : `Registámos o pagamento ${o.description}: ${o.amount}${o.dueOn ? `, até ${longDate(o.dueOn)}` : ""}.`}\n\nVer os pagamentos: ${href}`,
  };
}

/** Link de acesso enviado por email (M5-12, RF-30.52). */
export function accessLinkEmail(o: { clientName: string; projectName: string; url: string }) {
  return {
    subject: `O seu acesso a ${o.projectName}`,
    html: layout({
      preheader: "Toque no botão para entrar na Área do Cliente. O link vale 24 horas.",
      title: `Olá ${firstName(o.clientName)}, aqui está o seu acesso`,
      body: `<p style="margin:0 0 12px">Toque no botão para entrar no projeto <strong>${esc(o.projectName)}</strong>. Não precisa de senha.</p>
<p style="margin:0;color:#8a85a3;font-size:13px">O link funciona uma vez e vale 24 horas. Se expirar, peça um novo ao João.</p>`,
      cta: { href: o.url, label: "Entrar no meu projeto" },
    }),
    text: `Olá ${firstName(o.clientName)},\n\nEntre no projeto ${o.projectName} (sem senha):\n${o.url}\n\nO link funciona uma vez e vale 24 horas.`,
  };
}

/** Aviso ao João: ficheiros a apagar dentro de 7 dias (#122, RN-08). */
export function retentionWarningEmail(o: { projects: { id: string; name: string; clientName: string; purgeOn: string; days: number }[] }) {
  const items = o.projects.map((p) => ({
    ...p,
    href: `${SITE_URL}/admin/projetos/${p.id}#ficheiros-retencao`,
    when: `${longDate(p.purgeOn)} (${p.days === 1 ? "amanhã" : `daqui a ${p.days} dias`})`,
  }));
  return {
    subject: `Ficheiros a apagar em breve: ${items.length} projeto${items.length === 1 ? "" : "s"}`,
    html: layout({
      preheader: "Os ficheiros destes projetos concluídos vão ser apagados do armazenamento.",
      title: "Ficheiros a apagar em breve",
      body: `<p style="margin:0 0 12px">Os ficheiros destes projetos concluídos vão ser apagados do armazenamento (fica o registo). Para os guardar mais tempo, abra o projeto e carregue em <strong>Adiar 30 dias</strong>.</p>
<ul style="margin:0;padding-left:20px">${items
        .map((p) => `<li style="margin-bottom:6px"><a href="${esc(p.href)}" style="color:#6d4cff">${esc(p.name)}</a> · ${esc(p.clientName)} · ${esc(p.when)}</li>`)
        .join("")}</ul>`,
      cta: { href: items[0]?.href ?? `${SITE_URL}/admin`, label: "Abrir o projeto" },
    }),
    text: `Ficheiros a apagar em breve (fica o registo). Para adiar, abra o projeto e carregue em "Adiar 30 dias".\n\n${items.map((p) => `- ${p.name} (${p.clientName}): ${p.when}\n  ${p.href}`).join("\n")}`,
  };
}

/** Entrega final disponível (M6-06, RF-10.63). */
export function deliveryEmail(o: { clientName: string; projectName: string; lastDay: string; adjustDays: number }) {
  const href = `${SITE_URL}/cliente/entregas`;
  return {
    subject: `${o.projectName}: a entrega final está disponível`,
    html: layout({
      preheader: "Já pode descarregar o trabalho final em PDF e Word.",
      title: "A entrega final está disponível",
      body: `<p style="margin:0 0 12px">Olá ${esc(firstName(o.clientName))}, o trabalho final de <strong>${esc(o.projectName)}</strong> já está na Área do Cliente, em PDF e Word.</p>
<p style="margin:0">Tem <strong>${o.adjustDays} dias</strong> para pedir ajustes (até ${esc(longDate(o.lastDay))}).</p>`,
      cta: { href, label: "Descarregar a entrega" },
    }),
    text: `Olá ${firstName(o.clientName)},\n\nO trabalho final de ${o.projectName} já está disponível em PDF e Word: ${href}\nTem ${o.adjustDays} dias para pedir ajustes (até ${longDate(o.lastDay)}).`,
  };
}

/** Novo pedido de ajuste (para o João, M6-06). */
export function adjustmentRequestEmail(o: { clientName: string; projectName: string; projectId: string; description: string }) {
  const href = `${SITE_URL}/admin/projetos/${o.projectId}#ajustes`;
  return {
    subject: `Pedido de ajuste: ${o.projectName}`,
    html: layout({
      preheader: o.description.slice(0, 120),
      title: "Novo pedido de ajuste",
      body: `<p style="margin:0 0 12px"><strong>${esc(o.clientName)}</strong> pediu um ajuste em ${esc(o.projectName)}:</p>
<blockquote style="margin:0;padding:12px 16px;border-left:3px solid #8b6cff;background:#f7f5ff;border-radius:8px;white-space:pre-wrap">${esc(o.description)}</blockquote>`,
      cta: { href, label: "Ver o pedido" },
    }),
    text: `${o.clientName} pediu um ajuste em ${o.projectName}:\n\n${o.description}\n\n${href}`,
  };
}

/** Resposta a um pedido de ajuste (para o cliente, M6-06). */
export function adjustmentClosedEmail(o: { clientName: string; projectName: string; resolved: boolean; note?: string | null }) {
  const href = `${SITE_URL}/cliente`;
  const title = o.resolved ? "O seu ajuste está feito" : "Sobre o seu pedido de ajuste";
  const line = o.resolved ? "Há uma versão nova da entrega final com o ajuste que pediu." : "Este pedido não está incluído nos ajustes.";
  return {
    subject: `${o.projectName}: ${title.toLowerCase()}`,
    html: layout({
      preheader: line,
      title,
      body: `<p style="margin:0 0 12px">Olá ${esc(firstName(o.clientName))}, ${esc(line)}</p>${o.note ? `<p style="margin:0">${esc(o.note)}</p>` : ""}`,
      cta: { href, label: "Ver o projeto" },
    }),
    text: `Olá ${firstName(o.clientName)},\n\n${line}${o.note ? `\n${o.note}` : ""}\n\n${href}`,
  };
}

/** Design (M7-05, RF-20.72): a peça está pronta para levantar, ou o levantamento foi marcado. */
export function pickupEmail(o: { clientName: string; projectName: string; ready: boolean; when: string | null; place: string | null }) {
  const href = `${SITE_URL}/cliente`;
  const title = o.ready ? "A sua peça está pronta" : "Marcámos o levantamento";
  const line = [o.when && `<strong>${esc(o.when)}</strong>`, o.place && esc(o.place)].filter(Boolean).join(" · ");
  return {
    subject: `${o.projectName}: ${o.ready ? "pronto para levantar" : "levantamento marcado"}`,
    html: layout({
      preheader: o.ready ? "Já pode levantar a sua peça." : "Veja quando e onde levantar a sua peça.",
      title,
      body: `<p style="margin:0 0 12px">Olá ${esc(firstName(o.clientName))}, ${o.ready ? "a peça de" : "o levantamento de"} <strong>${esc(o.projectName)}</strong> ${o.ready ? "está pronta." : "está marcado."}</p>${
        line ? `<p style="margin:0">${line}</p>` : ""
      }`,
      cta: { href, label: "Ver na Área do Cliente" },
    }),
    text: `Olá ${firstName(o.clientName)},\n\n${title}: ${o.projectName}.${o.when ? `\n${o.when}` : ""}${o.place ? `\n${o.place}` : ""}\n\n${href}`,
  };
}

