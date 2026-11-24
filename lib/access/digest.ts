/** SHA-256 (hex) do token do link mágico: é o que fica em access_links.token_digest (L3, D-069). Só no servidor. */
import { createHash } from "node:crypto";

export const digest = (token: string) => createHash("sha256").update(token, "utf8").digest("hex");
