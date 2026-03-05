// ══════════════════════════════════════════
//  CONSTANTES DE TEMPO
// ══════════════════════════════════════════
const SETE_DIAS   = 7  * 24 * 60 * 60 * 1000;
const TRINTA_DIAS = 30 * 24 * 60 * 60 * 1000;

// ══════════════════════════════════════════
//  UTILIZADOR LOGADO
// ══════════════════════════════════════════
const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
const nomeAutor     = usuarioLogado?.nome || "Anônimo";

// ══════════════════════════════════════════
//  ANO NO RODAPÉ
// ══════════════════════════════════════════
const anoEl = document.getElementById("ano");
if (anoEl) anoEl.textContent = new Date().getFullYear();

// ══════════════════════════════════════════
//  BOTÃO SAIR
// ══════════════════════════════════════════
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("usuarioLogado");
    window.location.href = "log.html";
  });
}

// ══════════════════════════════════════════
//  LIMPAR EXPIRADOS
// ══════════════════════════════════════════
function limparExpirados() {
  const agora = Date.now();

  const vagas = JSON.parse(localStorage.getItem("vagas")) || [];
  localStorage.setItem("vagas", JSON.stringify(
    vagas.filter(v => !v.dataPublicacao || (agora - v.dataPublicacao) < SETE_DIAS)
  ));

  const curriculos = JSON.parse(localStorage.getItem("curriculos")) || [];
  localStorage.setItem("curriculos", JSON.stringify(
    curriculos.filter(c => !c.dataPublicacao || (agora - c.dataPublicacao) < TRINTA_DIAS)
  ));
}

limparExpirados();

// ══════════════════════════════════════════
//  CALCULAR DIAS RESTANTES
// ══════════════════════════════════════════
function diasRestantes(dataPublicacao, prazo) {
  const diff = prazo - (Date.now() - dataPublicacao);
  const dias  = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (dias <= 0)  return "Expira hoje";
  if (dias === 1) return "Expira amanhã";
  return `Expira em ${dias} dias`;
}

// ══════════════════════════════════════════
//  RENDERIZAR LISTA DE PUBLICAÇÕES
// ══════════════════════════════════════════
function renderizarMinhasPublicacoes() {
  const container = document.getElementById("minhasPublicacoes");
  if (!container) return;

  const vagas      = JSON.parse(localStorage.getItem("vagas"))      || [];
  const curriculos = JSON.parse(localStorage.getItem("curriculos")) || [];

  const minhasVagas    = vagas.filter(v => v.autor === nomeAutor);
  const meusCurriculos = curriculos.filter(c => c.autor === nomeAutor);

  container.innerHTML = "";

  if (minhasVagas.length === 0 && meusCurriculos.length === 0) {
    container.innerHTML = `<p class="pub-vazia">Ainda não publicaste nada. As tuas publicações aparecerão aqui.</p>`;
    return;
  }

  // ── VAGAS ──
  if (minhasVagas.length > 0) {
    const sec = document.createElement("div");
    sec.className   = "pub-secao-titulo";
    sec.textContent = "💼 Vagas publicadas";
    container.appendChild(sec);

    minhasVagas.forEach((vaga, i) => {
      const urgente = (Date.now() - vaga.dataPublicacao) > (SETE_DIAS * 0.8);
      const item    = document.createElement("div");
      item.className = "pub-item";
      item.innerHTML = `
        <div class="pub-item-info">
          <span class="pub-item-categoria">${vaga.categoria || "Geral"}</span>
          <span class="pub-item-titulo">${vaga.titulo}</span>
          <span class="pub-item-desc">${vaga.descricao.substring(0,80)}${vaga.descricao.length > 80 ? "…" : ""}</span>
        </div>
        <div class="pub-item-meta">
          <span class="pub-item-prazo ${urgente ? "urgente" : ""}">
            <i class="fa-regular fa-clock"></i> ${diasRestantes(vaga.dataPublicacao, SETE_DIAS)}
          </span>
          <button class="pub-item-apagar" data-tipo="vaga" data-index="${i}">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      `;
      container.appendChild(item);
    });
  }

  // ── CURRÍCULOS ──
  if (meusCurriculos.length > 0) {
    const sec = document.createElement("div");
    sec.className   = "pub-secao-titulo";
    sec.textContent = "📄 Currículos enviados";
    container.appendChild(sec);

    meusCurriculos.forEach((curr, i) => {
      const urgente = (Date.now() - curr.dataPublicacao) > (TRINTA_DIAS * 0.8);
      const item    = document.createElement("div");
      item.className = "pub-item";
      item.innerHTML = `
        <div class="pub-item-info">
          <span class="pub-item-categoria">Currículo</span>
          <span class="pub-item-desc">${curr.info.substring(0,100)}${curr.info.length > 100 ? "…" : ""}</span>
        </div>
        <div class="pub-item-meta">
          <span class="pub-item-prazo ${urgente ? "urgente" : ""}">
            <i class="fa-regular fa-clock"></i> ${diasRestantes(curr.dataPublicacao, TRINTA_DIAS)}
          </span>
          <button class="pub-item-apagar" data-tipo="curriculo" data-index="${i}">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      `;
      container.appendChild(item);
    });
  }

  // botões apagar
  container.querySelectorAll(".pub-item-apagar").forEach(btn => {
    btn.addEventListener("click", function () {
      apagarPublicacao(this.dataset.tipo, parseInt(this.dataset.index));
    });
  });
}

// ══════════════════════════════════════════
//  APAGAR PUBLICAÇÃO
// ══════════════════════════════════════════
function apagarPublicacao(tipo, indexDoUtilizador) {
  if (tipo === "vaga") {
    const vagas       = JSON.parse(localStorage.getItem("vagas")) || [];
    const minhasVagas = vagas.filter(v => v.autor === nomeAutor);
    const alvo        = minhasVagas[indexDoUtilizador];
    const idx = vagas.findIndex(v =>
      v.autor === alvo.autor && v.titulo === alvo.titulo && v.dataPublicacao === alvo.dataPublicacao
    );
    if (idx !== -1) vagas.splice(idx, 1);
    localStorage.setItem("vagas", JSON.stringify(vagas));
  } else {
    const curriculos     = JSON.parse(localStorage.getItem("curriculos")) || [];
    const meusCurriculos = curriculos.filter(c => c.autor === nomeAutor);
    const alvo           = meusCurriculos[indexDoUtilizador];
    const idx = curriculos.findIndex(c =>
      c.autor === alvo.autor && c.info === alvo.info && c.dataPublicacao === alvo.dataPublicacao
    );
    if (idx !== -1) curriculos.splice(idx, 1);
    localStorage.setItem("curriculos", JSON.stringify(curriculos));
  }

  mostrarToast("🗑️ Publicação removida.");
  renderizarMinhasPublicacoes();
}

// ══════════════════════════════════════════
//  FORMULÁRIO — DIVULGAR TRABALHO
// ══════════════════════════════════════════
const formTrabalho = document.getElementById("trabalho")?.querySelector("form");
if (formTrabalho) {
  formTrabalho.addEventListener("submit", function (e) {
    e.preventDefault();
    const titulo    = this.querySelector("#titulo")?.value.trim();
    const descricao = this.querySelector("#descricao")?.value.trim();

    if (!titulo || !descricao) {
      mostrarToast("⚠️ Preencha o título e a descrição.", "erro");
      return;
    }

    const vaga = {
      titulo, descricao,
      categoria:      inferirCategoria(titulo + " " + descricao),
      autor:          nomeAutor,
      contato:        nomeAutor,
      dataPublicacao: Date.now()
    };

    const vagas = JSON.parse(localStorage.getItem("vagas")) || [];
    vagas.push(vaga);
    localStorage.setItem("vagas", JSON.stringify(vagas));

    mostrarToast("✅ Trabalho divulgado! Expira em 7 dias.");
    this.reset();
    renderizarMinhasPublicacoes();
    setTimeout(() => { window.location.href = "inicio.html"; }, 1600);
  });
}

// ══════════════════════════════════════════
//  FORMULÁRIO — ENVIAR CURRÍCULO
// ══════════════════════════════════════════
const formCurriculo = document.getElementById("curiculum")?.querySelector("form");
if (formCurriculo) {
  formCurriculo.addEventListener("submit", function (e) {
    e.preventDefault();
    const info = this.querySelector("#info")?.value.trim();

    if (!info) {
      mostrarToast("⚠️ Escreva as suas informações pessoais.", "erro");
      return;
    }

    const curriculo = { info, autor: nomeAutor, dataPublicacao: Date.now() };
    const curriculos = JSON.parse(localStorage.getItem("curriculos")) || [];
    curriculos.push(curriculo);
    localStorage.setItem("curriculos", JSON.stringify(curriculos));

    mostrarToast("✅ Currículo enviado! Expira em 30 dias.");
    this.reset();
    renderizarMinhasPublicacoes();
    setTimeout(() => { window.location.href = "inicio.html"; }, 1600);
  });
}

// ══════════════════════════════════════════
//  INFERIR CATEGORIA
// ══════════════════════════════════════════
function inferirCategoria(texto) {
  const t = texto.toLowerCase();
  if (t.includes("eletric") || t.includes("tomada") || t.includes("energia"))   return "Eletricista";
  if (t.includes("carpint") || t.includes("madeira") || t.includes("porta"))    return "Carpinteiro";
  if (t.includes("pedreir") || t.includes("constru") || t.includes("ciment"))   return "Pedreiro";
  if (t.includes("moto")    || t.includes("chapas"))                             return "Taxista de moto";
  if (t.includes("motorist")|| t.includes("carro")   || t.includes("transport")) return "Motorista";
  if (t.includes("serralhei")|| t.includes("grade")  || t.includes("ferro"))    return "Seralheiro";
  return "Geral";
}

// ══════════════════════════════════════════
//  TOAST
// ══════════════════════════════════════════
function mostrarToast(msg, tipo = "sucesso") {
  document.getElementById("sb-toast")?.remove();
  const toast = document.createElement("div");
  toast.id    = "sb-toast";
  toast.textContent = msg;
  Object.assign(toast.style, {
    position: "fixed", bottom: "5rem", left: "50%",
    transform: "translateX(-50%)",
    background: tipo === "erro" ? "rgba(255,75,92,0.95)" : "linear-gradient(135deg,#4df1d0 -20%,#0faf32 100%)",
    color: tipo === "erro" ? "#fff" : "#0d1b12",
    padding: "0.85rem 1.8rem", borderRadius: "50px",
    fontFamily: "'DM Sans',sans-serif", fontWeight: "700", fontSize: "0.95rem",
    zIndex: "9999", boxShadow: "0 8px 30px rgba(0,0,0,0.35)",
    animation: "toastIn 0.3s ease both", whiteSpace: "nowrap"
  });
  if (!document.getElementById("toast-style")) {
    const s = document.createElement("style");
    s.id = "toast-style";
    s.textContent = `@keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(20px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`;
    document.head.appendChild(s);
  }
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(-50%) translateY(20px)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 1500);
}

// ══════════════════════════════════════════
//  BARRA DE PESQUISA
// ══════════════════════════════════════════
const searchInput   = document.getElementById("searchInput");
const resultadosDiv = document.getElementById("resultadosBusca");

function pesquisar() {
  if (event) event.preventDefault();
  if (!searchInput || !resultadosDiv) return;
  const query      = searchInput.value.toLowerCase();
  const vagasSalvas = JSON.parse(localStorage.getItem("vagas")) || [];
  resultadosDiv.innerHTML = "";

  const resultados = vagasSalvas.filter(v =>
    (v.titulo || "").toLowerCase().includes(query) ||
    (v.descricao || "").toLowerCase().includes(query) ||
    (v.categoria || "").toLowerCase().includes(query)
  );

  if (resultados.length === 0) {
    resultadosDiv.innerHTML = "<p style='padding:1rem;color:rgba(248,255,254,0.5)'>Nenhum resultado encontrado.</p>";
  } else {
    resultados.forEach(v => {
      const item = document.createElement("div");
      item.style.cssText = "padding:0.75rem 1rem;border-bottom:1px solid rgba(77,241,208,0.1);cursor:pointer;";
      item.innerHTML = `<strong style="color:#4df1d0">${v.categoria || "Geral"}</strong><p style="font-size:0.83rem;color:rgba(248,255,254,0.5)">${v.descricao}</p>`;
      item.addEventListener("click", () => window.location.href = "Nampula.html");
      resultadosDiv.appendChild(item);
    });
  }
  resultadosDiv.style.display = "block";
}

if (searchInput && resultadosDiv) {
  document.getElementById("searchBtn")?.addEventListener("click", pesquisar);
  searchInput.addEventListener("keydown", e => { if (e.key === "Enter") pesquisar(); });
  searchInput.addEventListener("focus",   () => { resultadosDiv.style.display = "block"; });
  searchInput.addEventListener("blur",    () => { setTimeout(() => { resultadosDiv.style.display = "none"; }, 200); });
}

// ══════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════
renderizarMinhasPublicacoes();