/* ============================================================
   main.js — lógica de negócio e interações
   (formulários, marca d'água, grupos, busca de comitê, ripple)
   Dados da busca: js/dados-comites.js
============================================================ */

/* ---------- CONFIGURAÇÃO DA CAMPANHA (edite aqui) ---------- */
const CONFIG = {
  candidato: "Felipe Sertanejo",
  numero: "00000", // número do candidato (marca d'água) — atualizar
  logoSrc: "assets/images/logo.png",
  whatsapp: "https://chat.whatsapp.com/SEU-LINK",
  telegram: "https://t.me/SEU-CANAL",
};

/* ---------- Utilidades ---------- */
const $ = (sel) => document.querySelector(sel);
const show = (el) => {
  el.classList.remove("is-hidden");
  if (window.animateIn) window.animateIn(el);
};
const hide = (el) => el.classList.add("is-hidden");
const norm = (s) =>
  s.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

window.addEventListener("DOMContentLoaded", () => {
  /* ---------- Ripple em todos os botões ---------- */
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn");
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const ink = document.createElement("span");
    ink.className = "ripple-ink";
    ink.style.width = ink.style.height = `${size}px`;
    ink.style.left = `${e.clientX - rect.left - size / 2}px`;
    ink.style.top = `${e.clientY - rect.top - size / 2}px`;
    btn.appendChild(ink);
    setTimeout(() => ink.remove(), 650);
  });

  /* ============================================================
     MÓDULO 01 — Formulário de material
  ============================================================ */
  const form = $("#materialForm");

  $("#openMaterialForm").addEventListener("click", (e) => {
    hide(e.currentTarget);
    show(form);
    form.querySelector("input").focus();
  });

  const validateField = (input) => {
    const field = input.closest(".form__field");
    const ok = input.checkValidity();
    field.classList.toggle("has-error", !ok);
    input.classList.toggle("is-invalid", !ok);
    return ok;
  };

  form.querySelectorAll("input").forEach((input) => {
    input.addEventListener("blur", () => validateField(input));
    input.addEventListener("input", () => {
      if (input.classList.contains("is-invalid")) validateField(input);
    });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const inputs = [...form.querySelectorAll("input")];
    const allOk = inputs.map(validateField).every(Boolean);
    if (!allOk) {
      form.querySelector(".is-invalid")?.focus();
      return;
    }

    const data = Object.fromEntries(new FormData(form));
    /* >>> INTEGRAÇÃO: envie "data" para seu backend aqui
       (Formspree, Supabase, Google Apps Script...) */
    console.info("[cadastro de material]", data);

    hide(form);
    show($("#materialOk"));
  });

  /* ============================================================
     MÓDULO 02 — Foto com marca d'água (100% no navegador)
  ============================================================ */
  const photoInput = $("#photoInput");

  $("#photoBtn").addEventListener("click", () => photoInput.click());

  $("#photoReset").addEventListener("click", () => {
    hide($("#photoResult"));
    show($("#photoBtn"));
    photoInput.value = "";
  });

  photoInput.addEventListener("change", async () => {
    const file = photoInput.files[0];
    if (!file) return;

    const img = await loadImage(URL.createObjectURL(file));
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    const pad = Math.round(canvas.width * 0.035);
    const badgeH = Math.round(canvas.width * 0.09);

    const grad = ctx.createLinearGradient(0, canvas.height - badgeH * 2, 0, canvas.height);
    grad.addColorStop(0, "rgba(0,0,0,0)");
    grad.addColorStop(1, "rgba(0,0,0,0.55)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, canvas.height - badgeH * 2, canvas.width, badgeH * 2);

    try {
      const logo = await loadImage(CONFIG.logoSrc);
      const h = badgeH;
      const w = (logo.width / logo.height) * h;
      ctx.drawImage(logo, pad, canvas.height - h - pad, w, h);
    } catch {
      const r = badgeH * 0.45;
      const lg = ctx.createLinearGradient(pad, 0, pad + r * 2, 0);
      lg.addColorStop(0, "#009C3B");
      lg.addColorStop(1, "#FFDF00");
      ctx.fillStyle = lg;
      ctx.beginPath();
      ctx.arc(pad + r, canvas.height - pad - r, r, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.font = `700 ${badgeH * 0.8}px Inter, sans-serif`;
    ctx.fillStyle = "#fff";
    ctx.textAlign = "right";
    ctx.textBaseline = "bottom";
    ctx.shadowColor = "rgba(0,0,0,0.4)";
    ctx.shadowBlur = 8;
    ctx.fillText(CONFIG.numero, canvas.width - pad, canvas.height - pad);

    const url = canvas.toDataURL("image/jpeg", 0.92);
    $("#photoImg").src = url;
    $("#photoDownload").href = url;
    hide($("#photoBtn"));
    show($("#photoResult"));
  });

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  /* ============================================================
     MÓDULO 03 — Grupos oficiais
  ============================================================ */
  $("#groupBtn").addEventListener("click", (e) => {
    const links = $("#groupLinks");
    links.querySelector(".btn--whatsapp").href = CONFIG.whatsapp;
    links.querySelector(".btn--telegram").href = CONFIG.telegram;
    hide(e.currentTarget);
    show(links);
  });

  /* ============================================================
     MÓDULO 04 — Busca de comitês (apenas Estado de São Paulo)
     Toda a base editável fica em js/dados-comites.js
  ============================================================ */
  const { PADRAO, CIDADES_ESPECIAIS, SEM_COMITE, MSG_SEM_COMITE, CIDADES_SP } =
    window.DADOS_CAMPANHA;

  const input = $("#finderCity");
  const list = $("#cityList");
  let activeIndex = -1;

  /* ---------- Autocomplete com sugestão automática ---------- */
  const sugestoes = [...new Set(CIDADES_SP)].sort((a, b) =>
    a.localeCompare(b, "pt-BR")
  );

  function renderList(term) {
    const q = norm(term);
    const matches = q
      ? sugestoes.filter((c) => norm(c).includes(q)).slice(0, 8)
      : [];
    list.innerHTML = "";
    activeIndex = -1;

    if (!matches.length) {
      hide(list);
      input.setAttribute("aria-expanded", "false");
      return;
    }

    matches.forEach((cidade) => {
      const li = document.createElement("li");
      li.setAttribute("role", "option");
      // destaca o trecho digitado
      const i = norm(cidade).indexOf(q);
      li.innerHTML =
        cidade.slice(0, i) +
        "<mark>" + cidade.slice(i, i + term.trim().length) + "</mark>" +
        cidade.slice(i + term.trim().length);
      li.addEventListener("mousedown", (e) => {
        e.preventDefault(); // não perde o foco antes do click
        selectCity(cidade);
      });
      list.appendChild(li);
    });

    show(list);
    input.setAttribute("aria-expanded", "true");
  }

  function selectCity(cidade) {
    input.value = cidade;
    hide(list);
    input.setAttribute("aria-expanded", "false");
    buscarComite();
  }

  input.addEventListener("input", () => renderList(input.value));
  input.addEventListener("focus", () => renderList(input.value));
  input.addEventListener("blur", () => setTimeout(() => hide(list), 150));

  // Navegação por teclado: ↑ ↓ Enter Esc
  input.addEventListener("keydown", (e) => {
    const items = [...list.querySelectorAll("li")];
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      if (!items.length) return;
      e.preventDefault();
      activeIndex =
        (activeIndex + (e.key === "ArrowDown" ? 1 : -1) + items.length) %
        items.length;
      items.forEach((li, i) =>
        li.setAttribute("aria-selected", i === activeIndex ? "true" : "false")
      );
      items[activeIndex].scrollIntoView({ block: "nearest" });
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && items[activeIndex])
        selectCity(items[activeIndex].textContent);
      else buscarComite();
    } else if (e.key === "Escape") {
      hide(list);
    }
  });

  /* ---------- Busca ---------- */
  function buscarComite() {
    const cidade = input.value.trim();
    if (!cidade) return;

    const foundCard = $("#committeeCard");
    const noCard = $("#noCommitteeCard");
    hide(foundCard);
    hide(noCard);

    // 1) Região sem comitê? (Praia Grande + Vale do Paraíba)
    if (SEM_COMITE.some((c) => norm(c) === norm(cidade))) {
      $("#noTitle").textContent = properCase(cidade);
      $("#noMsg").textContent = MSG_SEM_COMITE;
      show(noCard);
      return;
    }

    // 2) Cidade com conteúdo personalizado?
    const especial = CIDADES_ESPECIAIS.find((c) => norm(c.cidade) === norm(cidade));

    // 3) Demais cidades de SP: modelo padrão
    const dados = especial ?? { ...PADRAO, cidade: properCase(cidade), descricao: "" };

    renderComite(dados);
    show(foundCard);
  }

  function renderComite(d) {
    $("#cTitle").textContent = `Comitê de ${d.cidade}`;

    const desc = $("#cDesc");
    if (d.descricao) {
      desc.textContent = d.descricao;
      desc.classList.remove("is-hidden");
    } else {
      desc.classList.add("is-hidden");
    }

    $("#cLeader").textContent = d.lideranca || PADRAO.lideranca;
    $("#cAddress").textContent = d.endereco || PADRAO.endereco;

    const events = $("#cEvents");
    events.innerHTML = "";
    (d.proximosEventos?.length ? d.proximosEventos : PADRAO.proximosEventos).forEach(
      (ev) => {
        const li = document.createElement("li");
        li.textContent = ev;
        events.appendChild(li);
      }
    );

    $("#cMaps").href =
      d.googleMaps ||
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${d.endereco || d.cidade}, SP`
      )}`;
    $("#cWhats").href = `https://wa.me/${d.whatsapp || PADRAO.whatsapp}`;
  }

  // Primeira letra maiúscula em cada palavra (para cidades digitadas)
  function properCase(s) {
    return s
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .map((w) => (w.length > 2 ? w[0].toUpperCase() + w.slice(1) : w))
      .join(" ")
      .replace(/\b(D)(a|e|o|as|os)\b/g, (m) => m.toLowerCase());
  }

  $("#finderBtn").addEventListener("click", buscarComite);
});
