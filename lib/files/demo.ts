/** Ficheiros de exemplo para o modo de demonstração (sem Supabase), M5-09. */
import { at } from "@/lib/portal/mock-data";
import type { FileSeries } from "./data";

const DEMO: Record<string, FileSeries[]> = {
  p_mono: [
    {
      key: "indice",
      title: "Índice proposto",
      role: "prova",
      phase: { key: "estrutura", name: "Estrutura (índice)", position: 3 },
      versions: [
        { deliverableId: "d_idx2", versionNo: 2, label: "V2", notes: "Juntámos o capítulo da metodologia, como pediu.", uploadedBy: "admin", createdAt: at(-6, 11), locked: false, purged: false, files: [{ id: "fx_idx2", name: "indice-v2.pdf", mime: "application/pdf", size: 182_000, purged: false }] },
        { deliverableId: "d_idx1", versionNo: 1, label: "V1", notes: null, uploadedBy: "admin", createdAt: at(-9, 16), locked: false, purged: false, files: [{ id: "fx_idx1", name: "indice-v1.pdf", mime: "application/pdf", size: 176_000, purged: false }] },
      ],
    },
    {
      key: "ref-pedido-briefing",
      title: "Referências",
      role: "referencia",
      phase: { key: "pedido-briefing", name: "Pedido e briefing", position: 1 },
      versions: [
        { deliverableId: "d_ref1", versionNo: 1, label: "V1", notes: null, uploadedBy: "client", createdAt: at(-14, 9), locked: false, purged: false, files: [
          { id: "fx_ref1", name: "normas-apa-universidade.pdf", mime: "application/pdf", size: 1_240_000, purged: false },
          { id: "fx_ref2", name: "enunciado.docx", mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", size: 48_000, purged: false },
        ] },
      ],
    },
  ],
  p_convite: [
    {
      key: "convite",
      title: "Convite",
      role: "prova",
      phase: { key: "revisoes", name: "Revisões", position: 4 },
      versions: [
        { deliverableId: "d_conv2", versionNo: 2, label: "V2", notes: "Nomes maiores e a data corrigida para sábado.", uploadedBy: "admin", createdAt: at(-1, 15), locked: false, purged: false, files: [
          { id: "fx_c2f", name: "convite-v2-frente.jpg", mime: "image/jpeg", size: 2_400_000, purged: false },
          { id: "fx_c2v", name: "convite-v2-verso.jpg", mime: "image/jpeg", size: 2_100_000, purged: false },
        ] },
        { deliverableId: "d_conv1", versionNo: 1, label: "V1", notes: null, uploadedBy: "admin", createdAt: at(-5, 11), locked: false, purged: false, files: [
          { id: "fx_c1f", name: "convite-v1-frente.jpg", mime: "image/jpeg", size: 2_300_000, purged: false },
          { id: "fx_c1v", name: "convite-v1-verso.jpg", mime: "image/jpeg", size: 2_000_000, purged: false },
        ] },
      ],
    },
    {
      key: "ref-briefing",
      title: "Referências",
      role: "referencia",
      phase: { key: "briefing", name: "Briefing", position: 1 },
      versions: [
        { deliverableId: "d_cref", versionNo: 1, label: "V1", notes: null, uploadedBy: "client", createdAt: at(-10, 18), locked: false, purged: false, files: [
          { id: "fx_cr1", name: "convite-que-gostei.jpg", mime: "image/jpeg", size: 850_000, purged: false },
          { id: "fx_cr2", name: "textos-do-convite.docx", mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", size: 22_000, purged: false },
        ] },
      ],
    },
  ],
};

export const demoSeries = (projectId: string): FileSeries[] => DEMO[projectId] ?? [];
