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
