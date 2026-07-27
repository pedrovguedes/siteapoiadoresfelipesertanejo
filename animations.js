/* ============================================================
   animations.js — Lenis + GSAP + ScrollTrigger
   Toda a camada de movimento do site. Nenhuma lógica de negócio.
============================================================ */
window.addEventListener("DOMContentLoaded", () => {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Garantia extra: a frase NUNCA quebra no desktop ----------
     O clamp() já dimensiona por breakpoint; este ajuste fino reduz a
     fonte em passos de 2px caso a métrica real da fonte exceda a área. */
  const phrase = document.querySelector(".phrase__text");
  const fitPhrase = () => {
    if (!phrase || innerWidth < 1024) { phrase && (phrase.style.fontSize = ""); return; }
    phrase.style.fontSize = ""; // volta ao valor do CSS antes de medir
    let guard = 24;
    while (phrase.scrollWidth > phrase.clientWidth && guard--) {
      const size = parseFloat(getComputedStyle(phrase).fontSize);
      phrase.style.fontSize = size - 2 + "px";
    }
  };
  if (document.fonts?.ready) document.fonts.ready.then(fitPhrase);
  fitPhrase();
  addEventListener("resize", fitPhrase);

  // Ícones Lucide (substitui <i data-lucide> por SVG)
  if (window.lucide) lucide.createIcons();

  if (reduced || !window.gsap) return; // CSS já garante o estado final

  gsap.registerPlugin(ScrollTrigger);

  /* ---------- Scroll suave (Lenis) sincronizado com o ScrollTrigger ---------- */
  if (window.Lenis) {
    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
    });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);

    // Garante que o ScrollTrigger use as medidas certas da página
    ScrollTrigger.refresh();

    // Âncoras internas passam pelo Lenis
    document.querySelectorAll('a[href^="#"]').forEach((a) =>
      a.addEventListener("click", (e) => {
        const target = document.querySelector(a.getAttribute("href"));
        if (!target) return;
        e.preventDefault();
        lenis.scrollTo(target, { offset: 0 });
      })
    );
  } else {
    document.documentElement.classList.add("no-lenis");
  }

  /* Recalcula os gatilhos depois que fontes e imagens carregam
     (evita animações "fora do lugar" e travadas no scroll) */
  window.addEventListener("load", () => ScrollTrigger.refresh());
  if (document.fonts?.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());

  /* ---------- Hero: entrada orquestrada (fade + scale + blur) ---------- */
  gsap
    .timeline({ defaults: { ease: "power3.out" } })
    .to('[data-hero="1"]', { opacity: 1, y: 0, duration: 1, startAt: { y: 18 } }, 0.3)
    .to(
      '[data-hero="2"]',
      { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 1.3, startAt: { y: 40, scale: 0.96, filter: "blur(14px)" } },
      0.5
    )
    .to('[data-hero="3"]', { opacity: 1, y: 0, duration: 0.9, startAt: { y: 20 } }, 1.0)
    .to('[data-hero="5"]', { opacity: 1, x: 0, scale: 1, duration: 1.2, startAt: { x: 60, scale: 0.96 } }, 0.7)
    .to('[data-hero="4"]', { opacity: 1, duration: 0.9 }, 1.5);

  /* ---------- Hero: parallax + zoom do fundo ---------- */
  gsap.to("[data-parallax]", {
    scale: 1.16,
    yPercent: 10,
    ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
  });

  /* ---------- Frase: MASK REVEAL esquerda → direita (scrub) ----------
     A camada .phrase__fill começa com clip-path: inset(0 100% 0 0)
     e é "desmascarada" conforme o usuário rola — não é um fade. */
  gsap.fromTo(
    ".phrase__fill",
    { clipPath: "inset(0 100% 0 0)" },
    {
      clipPath: "inset(0 0% 0 0)",
      ease: "none",
      scrollTrigger: {
        trigger: ".phrase",
        start: "top 75%",
        end: "center 45%",
        scrub: true,
      },
    }
  );

  /* ---------- Reveal genérico: fade up + leve blur/scale ---------- */
  gsap.utils.toArray("[data-reveal]:not([data-photo-parallax])").forEach((el) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 50, scale: 0.98, filter: "blur(6px)" },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%" },
      }
    );
  });

  /* ---------- Cards de "formas de ajudar": stagger dedicado ---------- */
  ScrollTrigger.batch(".way", {
    start: "top 88%",
    onEnter: (batch) =>
      gsap.to(batch, { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 0.8, stagger: 0.12, ease: "power3.out", overwrite: true }),
  });

  /* ---------- Ícones das missões: floating suave ---------- */
  gsap.utils.toArray(".mission svg").forEach((icon, i) => {
    gsap.to(icon, {
      y: -6,
      rotate: i % 2 ? 4 : -4,
      duration: 2.4 + i * 0.2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
  });

  /* ---------- Contadores ---------- */
  document.querySelectorAll(".stat__num").forEach((el) => {
    const to = Number(el.dataset.to);
    const suffix = el.dataset.suffix || "";
    ScrollTrigger.create({
      trigger: el,
      start: "top 90%",
      once: true,
      onEnter: () => {
        const proxy = { v: 0 };
        gsap.to(proxy, {
          v: to,
          duration: 1.8,
          ease: "power3.out",
          onUpdate: () => (el.textContent = Math.round(proxy.v).toLocaleString("pt-BR") + suffix),
        });
      },
    });
  });


  /* ---------- Fotos do candidato: entrada + parallax sutil ---------- */
  gsap.utils.toArray("[data-photo-parallax]").forEach((photo) => {
    // entrada
    gsap.fromTo(
      photo,
      { opacity: 0, y: 60, scale: 0.96 },
      {
        opacity: 1, y: 0, scale: 1, duration: 1, ease: "power3.out",
        scrollTrigger: { trigger: photo, start: "top 90%" },
      }
    );
    // parallax leve da imagem interna durante o scroll
    const img = photo.querySelector("img");
    if (img) {
      gsap.fromTo(
        img,
        { yPercent: -6 },
        {
          yPercent: 6, ease: "none",
          scrollTrigger: { trigger: photo, start: "top bottom", end: "bottom top", scrub: true },
        }
      );
    }
  });

  /* ---------- Helper global: anima elementos criados dinamicamente ---------- */
  window.animateIn = (el) => gsap.fromTo(el, { opacity: 0, y: 26, scale: 0.98 }, { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: "power3.out" });
});
