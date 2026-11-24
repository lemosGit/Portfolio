/** Link mágico (M5-12): resumo do token, estado, URL e mensagens. */
import { describe, expect, it } from "vitest";
import { digest } from "@/lib/access/digest";
import { askNewLink, entryUrl, linkMessage, linkView, looksLikeToken, whatsappShare } from "@/lib/access/links";

describe("digest (L3, D-069)", () => {
  it("SHA-256 em hex de 64 caracteres, como a coluna token_digest", () => {
    expect(digest("abc")).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
    expect(digest("x")).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe("linkView (RF-30.51)", () => {
  const now = Date.parse("2026-11-24T12:00:00Z");
  it("ativo até expirar; usado e substituído ficam como estão", () => {
    expect(linkView({ status: "ativo", expiresAt: "2026-11-25T11:00:00Z" }, now)).toBe("ativo");
    expect(linkView({ status: "ativo", expiresAt: "2026-11-24T12:00:00Z" }, now)).toBe("expirado");
    expect(linkView({ status: "usado", expiresAt: "2026-11-25T11:00:00Z" }, now)).toBe("usado");
    expect(linkView({ status: "substituido", expiresAt: "2026-11-25T11:00:00Z" }, now)).toBe("substituido");
  });
});

describe("token, URL e mensagens", () => {
  it("só aceita tokens com o formato do Supabase", () => {
    expect(looksLikeToken("a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4")).toBe(true);
    expect(looksLikeToken("x")).toBe(false);
    expect(looksLikeToken("abc'; drop table--abcdefghijklmnop")).toBe(false);
    expect(looksLikeToken(undefined)).toBe(false);
  });
  it("o link é o nosso /cliente/entrar e nunca o do Supabase (L1)", () => {
    expect(entryUrl("https://joao-pereira.dev/", "tok")).toBe("https://joao-pereira.dev/cliente/entrar?t=tok");
  });
  it("WhatsApp sem número (Q-087) com a mensagem e o link", () => {
    const text = linkMessage({ clientName: "Teresa Mendes", projectName: "Convite", url: "https://x/cliente/entrar?t=1" });
    expect(text).toContain("Olá Teresa!");
    expect(text).toContain("vale 24 horas");
    expect(whatsappShare(text)).toMatch(/^https:\/\/wa\.me\/\?text=/);
    expect(askNewLink("244900000000")).toMatch(/^https:\/\/wa\.me\/244900000000\?text=/);
  });
});
