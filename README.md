# Portfólio — João Lemos Pereira

Next.js 15 · TypeScript · Tailwind CSS · Framer Motion · Lucide React · Lenis

## Arrancar

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

## O que tens de personalizar

| O quê | Onde |
|---|---|
| Email, LinkedIn, GitHub | `lib/data.ts` → `profile` |
| Fotografia | colocar em `public/foto.jpg` (vertical, ~1200×1500, rosto no terço superior) |
| Capturas dos projetos | `public/projects/<id>.png` (ids: `priceguard`, `girassol`, `candongueiro-pay`, `barcode-bridge`) |
| Textos, projetos, percurso | `lib/data.ts` |
| Cores | `tailwind.config.ts` (`accent`, `bg`, `ink`) |

Sem `foto.jpg` aparece um monograma "JL"; sem captura aparece um placeholder geométrico. Ambos desaparecem sozinhos quando adicionares os ficheiros.

## Estrutura

```
app/            layout, página, estilos globais
components/     Navbar, Hero, About, Skills, Projects, Journey, Contact, Footer
                BackgroundFX (malha de partículas + parallax), ProfilePhoto (tilt 3D)
lib/data.ts     todo o conteúdo
```

## Animações e acessibilidade

- Entrada progressiva (`Reveal`), título em máscara, contadores, linha do tempo ligada ao scroll
- Navegação com indicador animado (`layoutId`), barra de progresso e menu móvel em ecrã inteiro
- Scroll suave (Lenis), luz que acompanha o cursor nos cartões
- `prefers-reduced-motion` respeitado (Framer Motion, Lenis, canvas e CSS)
- Link "Saltar para o conteúdo", `aria-current`, foco visível, HTML semântico
- Canvas pausa com o separador oculto e limita partículas conforme o ecrã

## Publicar

Vercel: importar o repositório, sem configuração extra.

## Próximas melhorias sugeridas

1. Capturas reais e, se possível, links de demo/repositório (`link` em cada projeto)
2. Remover o fundo da fotografia e integrá-la com gradiente azul (o componente já aplica tinta e fade)
3. Versão EN com i18n do Next.js
4. Analytics leve (Vercel Analytics ou Plausible) e imagem Open Graph dedicada
