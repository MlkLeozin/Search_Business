
//  UTILIZADOR LOGADO

const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
const nomeAutor     = usuarioLogado?.nome || usuarioLogado?.email || "Anônimo";


//  ANO NO RODAPÉ

document.getElementById("ano").textContent = new Date().getFullYear();


//  CRIAR CARD DE VAGA  ← definida PRIMEIRO

function criarCard(vaga) {
  const container = document.getElementById("cardsContainer");
  if (!container) return;

  // calcula dias restantes
  const SETE_DIAS_MS  = 7 * 24 * 60 * 60 * 1000;
  const agora         = Date.now();
  const publicadoEm   = vaga.dataPublicacao || agora;
  const diasRestantes = Math.ceil((SETE_DIAS_MS - (agora - publicadoEm)) / (1000 * 60 * 60 * 24));
  const expiracao     = diasRestantes > 0
  ? `<i class="fa-regular fa-clock"></i> Expira em ${diasRestantes} dia${diasRestantes > 1 ? "s" : ""}`
  : `Expira hoje`;

  let icone = "💼";
  if (vaga.categoria === "Taxista de moto") icone = "🚖";
  if (vaga.categoria === "Motorista")        icone = "🚚";
  if (vaga.categoria === "Eletricista")      icone = "💡";
  if (vaga.categoria === "Carpinteiro")      icone = "🪚";
  if (vaga.categoria === "Pedreiro")         icone = "🧱";

  const identificador = vaga.autor || vaga.contato || "Anônimo";

  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = `
    <h1>${icone}</h1>
    <h2>${vaga.categoria}</h2>
    <p><strong style="color:var(--branco)">${identificador}</strong></p>
    <p>${vaga.descricao}</p>
    <p style="font-size:0.78rem;color:var(--ciano);margin-top:4px;">
      <i class="fa-solid fa-phone"></i> ${vaga.contato}
    </p>
    ${expiracao}
    <div class="button">
      <a href="Conversas.html?contato=${encodeURIComponent(identificador)}">
        <i class="fa-solid fa-comments"></i> Conversar
      </a>
    </div>
  `;

  container.appendChild(card);
}

//  CARREGAR VAGAS AO ABRIR A PÁGINA

window.addEventListener("load", function () {
  const SETE_DIAS_MS = 7 * 24 * 60 * 60 * 1000; // 7 dias em ms
  const agora        = Date.now();

  const vagas = JSON.parse(localStorage.getItem("vagas")) || [];

  // filtra só as vagas dentro do prazo
  const vagasValidas = vagas.filter(vaga => {
    // vagas antigas sem data — considera válida por segurança
    if (!vaga.dataPublicacao) return true;
    return (agora - vaga.dataPublicacao) < SETE_DIAS_MS;
  });

  // se houve remoção, atualiza o localStorage
  if (vagasValidas.length !== vagas.length) {
    localStorage.setItem("vagas", JSON.stringify(vagasValidas));
  }

  // renderiza só as válidas
  vagasValidas.forEach(vaga => criarCard(vaga));
});

//  FORMULÁRIO — PUBLICAR VAGA (só UM listener)

document.getElementById("formVaga").addEventListener("submit", function (event) {
  event.preventDefault();

  const vaga = {
    titulo:    this.titulo.value.trim(),
    descricao: this.descricao.value.trim(),
    contato:   this.contato.value.trim(),
    categoria: this.categoria.value,
    autor:     nomeAutor,
    dataPublicacao:  Date.now()
  };

  const vagas = JSON.parse(localStorage.getItem("vagas")) || [];
  vagas.push(vaga);
  localStorage.setItem("vagas", JSON.stringify(vagas));

  criarCard(vaga);
  this.reset();
  alert("✅ Vaga publicada com sucesso!");
});

//  CHAT INLINE
function enviarMensagem() {
  const input   = document.getElementById("chatInput");
  const chatBox = document.getElementById("chatMessages");
  if (!input || !chatBox) return;

  const mensagem = input.value.trim();
  if (mensagem === "") return;

  const novaMsg = document.createElement("p");
  novaMsg.innerHTML = `<strong style="color:var(--ciano)">${nomeAutor}:</strong> ${mensagem}`;
  chatBox.appendChild(novaMsg);

  input.value = "";
  chatBox.scrollTop = chatBox.scrollHeight;
}


//  BARRA DE PESQUISA
const searchBtn     = document.getElementById("searchBtn");
const searchInput   = document.getElementById("searchInput");
const resultadosDiv = document.getElementById("resultadosBusca");

if (searchBtn) {
  searchBtn.addEventListener("click", function (e) {
    e.preventDefault();
    const query = searchInput?.value.toLowerCase() || "";
    if (!resultadosDiv) return;

    resultadosDiv.innerHTML = "";
    const vagas = JSON.parse(localStorage.getItem("vagas")) || [];
    const resultados = vagas.filter(v =>
      v.titulo?.toLowerCase().includes(query) ||
      v.descricao?.toLowerCase().includes(query) ||
      v.categoria?.toLowerCase().includes(query)
    );

    if (resultados.length === 0) {
      resultadosDiv.innerHTML = "<p style='padding:1rem;color:var(--muted)'>Nenhum resultado encontrado.</p>";
    } else {
      resultados.forEach(v => {
        const item = document.createElement("div");
        item.style.cssText = "padding:0.75rem 1rem;border-bottom:1px solid var(--border);cursor:pointer;";
        item.innerHTML = `
          <strong style="color:var(--ciano)">${v.categoria}</strong>
          <p style="font-size:0.83rem;color:var(--muted)">${v.descricao}</p>
        `;
        resultadosDiv.appendChild(item);
      });
    }

    resultadosDiv.style.display = "block";
  });
}

if (searchInput && resultadosDiv) {
  searchInput.addEventListener("focus", () => {
    resultadosDiv.style.display = "block";
  });
  searchInput.addEventListener("blur", () => {
    setTimeout(() => { resultadosDiv.style.display = "none"; }, 200);
  });
}
