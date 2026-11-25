// @vitest-environment jsdom
/** M9-08: aviso fora do horário na página de mensagens (RF-30.63). */
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { HoursNotice } from "@/app/cliente/_components/HoursNotice";

afterEach(cleanup);

it("fora do horário, mostra o aviso como estado", () => {
  render(<HoursNotice open={false} />);
  expect(screen.getByRole("status").textContent).toBe("Entraremos em contacto assim que o horário de abertura estiver disponível.");
});

it("dentro do horário, não mostra nada", () => {
  const { container } = render(<HoursNotice open />);
  expect(container.innerHTML).toBe("");
});
