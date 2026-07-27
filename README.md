# Site de Apoiadores — HTML + GSAP

Landing page premium em HTML/CSS/JS puro (sem build), com GSAP + ScrollTrigger + Lenis.

## Estrutura
```
index.html
css/style.css        ← tokens, componentes e seções
css/responsive.css   ← breakpoints: 1920/1600/1440/1366/1280/1024/768/480
js/animations.js     ← Lenis, hero, mask reveal da frase, reveals, contadores
js/main.js           ← formulários, marca d'água, grupos, busca de comitê
assets/images|icons|videos
```

## Rodar localmente
Abra o `index.html` no navegador — ou sirva a pasta (`npx serve .`).

## Publicar
Arraste a pasta inteira no Netlify Drop (app.netlify.com/drop), ou use Vercel / Cloudflare Pages / GitHub Pages.

## Fotos do Felipe Sertanejo (coloque em assets/images/)
| Arquivo | Onde aparece | Sugestão |
|---|---|---|
| felipe-hero.jpg | Hero (retrato grande, 4:5) | alta resolução, fundo limpo |
| felipe-apoiadores.jpg | Seção "Como posso ajudar" (3:4) | interagindo com apoiadores |
| felipe-campanha.jpg | Módulo Material (4:5) | entregando santinhos / rua |
| mockup-celular.jpg | Módulo Foto (9:16) | celular exibindo a foto c/ marca |
| voluntarios.jpg | Módulo Missões (4:5) | grupos e voluntários |
| felipe-institucional.jpg | Rodapé (1:1) | foto institucional |
| logo.png | Marca d'água da foto de apoiador | fundo transparente |

Sem os arquivos, placeholders elegantes indicam cada espaço — basta soltar as fotos na pasta com esses nomes.

## Busca de comitês (só São Paulo)
- Campo único de **cidade com autocomplete** (teclado: ↑ ↓ Enter Esc).
- Toda a base fica em **js/dados-comites.js**: `CIDADES_ESPECIAIS` (SJC, Taubaté, Guaratinguetá, Jacareí, Pinda — com descrição e eventos), `SEM_COMITE` (Praia Grande + Vale do Paraíba), `PADRAO` (modelo das demais cidades) e `CIDADES_SP` (sugestões). Edite só esse arquivo para atualizar a campanha.

## Personalizar
1. Nome já aplicado: **Felipe Sertanejo — Deputado Estadual** (title, metadados, favicon FS, hero e rodapé).
2. `CONFIG` no topo do js/main.js: **número do candidato** (hoje 00000), links de WhatsApp/Telegram e logo.
4. Foto do hero: `assets/images/hero.jpg` (ou vídeo — bloco comentado no HTML). Sem arquivo, um gradiente institucional assume.
5. Logo da marca d'água: `assets/images/logo.png`. Sem arquivo, um selo de exemplo é desenhado.
6. Formulários: os pontos de integração estão marcados com `>>> INTEGRAÇÃO` no main.js (Formspree, Supabase etc.). Hoje os dados aparecem no console.

## Notas
- A frase "Como posso ajudar sendo apoiador?" fica em **uma linha** a partir de 1024px, com clamp() calibrado por breakpoint, e é revelada por **clip-path (mask reveal)** sincronizado com o scroll.
- `prefers-reduced-motion` desativa todas as animações.
