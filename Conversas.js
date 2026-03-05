// ══════════════════════════════════════════
//  FIREBASE
// ══════════════════════════════════════════
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, push, onValue, query, orderByChild }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const firebaseConfig = {
  apiKey:            "AIzaSyDSBpgO-6sMqZx46MOKfsetv1YXZuwO1c4",
  authDomain:        "search-business-c9498.firebaseapp.com",
  databaseURL:       "https://search-business-c9498-default-rtdb.firebaseio.com",
  projectId:         "search-business-c9498",
  storageBucket:     "search-business-c9498.firebasestorage.app",
  messagingSenderId: "863436816603",
  appId:             "1:863436816603:web:f148caa78e181c3ff50cfe"
};

const app = initializeApp(firebaseConfig);
const db  = getDatabase(app);

// ══════════════════════════════════════════
//  UTILIZADOR LOGADO
// ══════════════════════════════════════════
const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
const usuarioAtual  = usuarioLogado?.nome || "Visitante";

// ══════════════════════════════════════════
//  LIMPAR ID — Firebase não aceita . # $ [ ]
// ══════════════════════════════════════════
function limparId(str) {
  return str
    .replace(/\./g, "_")
    .replace(/#/g,  "_")
    .replace(/\$/g, "_")
    .replace(/\[/g, "_")
    .replace(/\]/g, "_")
    .replace(/@/g,  "_at_");
}

// ══════════════════════════════════════════
//  GERAR ID DA CONVERSA (único no mundo)
// ══════════════════════════════════════════
function gerarConversaId(userA, userB) {
  return [limparId(userA), limparId(userB)].sort().join("__");
}

// ══════════════════════════════════════════
//  ELEMENTOS
// ══════════════════════════════════════════
const contatosList     = document.getElementById("contatosList");
const chatEmpty        = document.getElementById("chatEmpty");
const chatHeader       = document.getElementById("chatHeader");
const chatHeaderName   = document.getElementById("chatHeaderName");
const chatHeaderAvatar = document.getElementById("chatHeaderAvatar");
const chatMessagesArea = document.getElementById("chatMessagesArea");
const chatInputBar     = document.getElementById("chatInputBar");
const msgInput         = document.getElementById("msgInput");
const sendBtn          = document.getElementById("sendBtn");
const backMobile       = document.getElementById("backMobile");
const sidebar          = document.getElementById("sidebar");
const searchContatos   = document.getElementById("searchContatos");

let conversaAtualId = null;
let unsubscribe     = null;
let todasConversas  = [];
let totalNaoLidas   = 0;

// ══════════════════════════════════════════
//  NOTIFICAÇÕES
// ══════════════════════════════════════════
function pedirPermissaoNotificacao() {
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }
}

function mostrarNotificacao(nome, texto) {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(`💬 ${nome}`, {
      body: texto,
      icon: "Screenshot__2_-removebg-preview.png"
    });
  }
}

// ══════════════════════════════════════════
//  SOM
// ══════════════════════════════════════════
function tocarSom() {
  try {
    const ctx  = new (window.AudioContext || window.webkitAudioContext)();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  } catch(e) {}
}

// ══════════════════════════════════════════
//  BADGE
// ══════════════════════════════════════════
function adicionarBadge(nomeContato) {
  const item = document.querySelector(`[data-nome="${nomeContato}"]`);
  if (!item) return;
  let badge = item.querySelector(".contato-badge");
  if (badge) {
    badge.textContent = parseInt(badge.textContent || "0") + 1;
  } else {
    badge             = document.createElement("span");
    badge.className   = "contato-badge";
    badge.textContent = "1";
    item.appendChild(badge);
  }
  item.classList.add("tem-novas");
  totalNaoLidas++;
  atualizarFab();
}

function removerBadge(nomeContato) {
  const item  = document.querySelector(`[data-nome="${nomeContato}"]`);
  const badge = item?.querySelector(".contato-badge");
  if (badge) {
    totalNaoLidas = Math.max(0, totalNaoLidas - parseInt(badge.textContent || "0"));
    badge.remove();
  }
  item?.classList.remove("tem-novas");
  atualizarFab();
}

function atualizarFab() {
  const fabBadge = document.getElementById("fabBadge");
  const fabChat  = document.getElementById("fab-chat");
  if (!fabBadge) return;
  if (totalNaoLidas > 0) {
    fabBadge.textContent   = totalNaoLidas > 99 ? "99+" : totalNaoLidas;
    fabBadge.style.display = "flex";
    fabChat?.classList.add("tem-novas");
  } else {
    fabBadge.style.display = "none";
    fabChat?.classList.remove("tem-novas");
  }
}

// ══════════════════════════════════════════
//  PREVIEW NA SIDEBAR
// ══════════════════════════════════════════
function atualizarPreview(nomeContato, texto) {
  const el = document.querySelector(`[data-nome="${nomeContato}"] .contato-preview`);
  if (el) el.textContent = texto;
}

// ══════════════════════════════════════════
//  ABRIR CONVERSA
// ══════════════════════════════════════════
function abrirConversa(nomeContato) {
  conversaAtualId = gerarConversaId(usuarioAtual, nomeContato);

  chatHeaderName.textContent   = nomeContato;
  chatHeaderAvatar.textContent = nomeContato.charAt(0).toUpperCase();

  chatEmpty.style.display        = "none";
  chatHeader.style.display       = "flex";
  chatMessagesArea.style.display = "flex";
  chatInputBar.style.display     = "flex";

  sidebar.classList.add("hidden");

  document.querySelectorAll(".contato-item").forEach(el =>
    el.classList.toggle("active", el.dataset.nome === nomeContato)
  );

  removerBadge(nomeContato);
  localStorage.setItem("lidas_" + conversaAtualId, Date.now());

  if (unsubscribe) unsubscribe();

  const msgRef = query(
    ref(db, `conversas/${conversaAtualId}/mensagens`),
    orderByChild("timestamp")
  );

  unsubscribe = onValue(msgRef, snapshot => {
    chatMessagesArea.innerHTML = "";
    let ultimaData  = "";
    let ultimoTexto = "";

    snapshot.forEach(child => {
      const msg     = child.val();
      const data    = new Date(msg.timestamp);
      const dataStr = data.toLocaleDateString("pt-BR");

      if (dataStr !== ultimaData) {
        const sep       = document.createElement("div");
        sep.className   = "msg-date-sep";
        sep.textContent = dataStr;
        chatMessagesArea.appendChild(sep);
        ultimaData = dataStr;
      }

      const isMeu       = msg.autor === usuarioAtual;
      const bolha       = document.createElement("div");
      bolha.className   = `msg-bubble ${isMeu ? "sent" : "received"}`;
      bolha.textContent = msg.texto;
      chatMessagesArea.appendChild(bolha);

      const hora       = document.createElement("div");
      hora.className   = `msg-time ${isMeu ? "right" : "left"}`;
      hora.textContent = new Date(msg.timestamp).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
      chatMessagesArea.appendChild(hora);

      ultimoTexto = msg.texto;
    });

    chatMessagesArea.scrollTop = chatMessagesArea.scrollHeight;
    if (ultimoTexto) atualizarPreview(nomeContato, ultimoTexto);
    localStorage.setItem("lidas_" + conversaAtualId, Date.now());
    removerBadge(nomeContato);
  });

  salvarConversaNaLista(nomeContato);
  msgInput.focus();
}

// ══════════════════════════════════════════
//  ENVIAR MENSAGEM
// ══════════════════════════════════════════
function enviarMensagem() {
  const texto = msgInput.value.trim();
  if (!texto || !conversaAtualId) return;

  push(ref(db, `conversas/${conversaAtualId}/mensagens`), {
    autor:     usuarioAtual,
    texto:     texto,
    timestamp: Date.now()
  });

  msgInput.value = "";
}

sendBtn.addEventListener("click", enviarMensagem);
msgInput.addEventListener("keydown", e => { if (e.key === "Enter") enviarMensagem(); });

// ══════════════════════════════════════════
//  RENDERIZAR CONTATO NA SIDEBAR
// ══════════════════════════════════════════
function renderizarContato(nomeContato) {
  const empty = contatosList.querySelector(".contato-empty");
  if (empty) empty.remove();
  if (contatosList.querySelector(`[data-nome="${nomeContato}"]`)) return;

  const li        = document.createElement("li");
  li.className    = "contato-item";
  li.dataset.nome = nomeContato;
  li.innerHTML    = `
    <div class="contato-avatar">${nomeContato.charAt(0).toUpperCase()}</div>
    <div class="contato-info">
      <div class="contato-name">${nomeContato}</div>
      <div class="contato-preview">Toque para abrir</div>
    </div>
  `;
  li.addEventListener("click", () => abrirConversa(nomeContato));
  contatosList.appendChild(li);
  todasConversas.push({ el: li, nome: nomeContato });

  const convId    = gerarConversaId(usuarioAtual, nomeContato);
  let totalAntigo = 0;

  onValue(
    query(ref(db, `conversas/${convId}/mensagens`), orderByChild("timestamp")),
    snapshot => {
      let ultimoTexto = "";
      let totalAtual  = 0;
      let naoLidas    = 0;
      const lidas     = parseInt(localStorage.getItem("lidas_" + convId) || "0");

      snapshot.forEach(child => {
        const msg   = child.val();
        ultimoTexto = msg.texto;
        totalAtual++;
        if (msg.autor !== usuarioAtual && msg.timestamp > lidas) naoLidas++;
      });

      atualizarPreview(nomeContato, ultimoTexto || "Toque para abrir");

      if (totalAtual > totalAntigo && naoLidas > 0 && convId !== conversaAtualId) {
        adicionarBadge(nomeContato);
        mostrarNotificacao(nomeContato, ultimoTexto);
        tocarSom();
      }

      totalAntigo = totalAtual;

      if (convId === conversaAtualId) {
        removerBadge(nomeContato);
        localStorage.setItem("lidas_" + convId, Date.now());
      }
    }
  );
}

// ══════════════════════════════════════════
//  SALVAR / CARREGAR CONVERSAS
// ══════════════════════════════════════════
function salvarConversaNaLista(nomeContato) {
  const chave = "sb_conversas_" + usuarioAtual;
  const lista = JSON.parse(localStorage.getItem(chave)) || [];
  if (!lista.includes(nomeContato)) {
    lista.push(nomeContato);
    localStorage.setItem(chave, JSON.stringify(lista));
  }
  renderizarContato(nomeContato);
}

function carregarConversas() {
  const lista = JSON.parse(localStorage.getItem("sb_conversas_" + usuarioAtual)) || [];
  lista.forEach(nome => renderizarContato(nome));
}

// ══════════════════════════════════════════
//  LER URL — ?contato=Nome
// ══════════════════════════════════════════
function verificarURL() {
  const params  = new URLSearchParams(window.location.search);
  const contato = params.get("contato");
  if (!contato) return;

  if (contato === usuarioAtual) {
    chatEmpty.innerHTML = `
      <div class="chat-empty-icon">😅</div>
      <h2>Esta é a sua vaga</h2>
      <p>Não pode conversar consigo mesmo.<br>
      Aguarde que outro utilizador clique em <strong>Conversar</strong>.</p>
    `;
    return;
  }

  salvarConversaNaLista(contato);
  abrirConversa(contato);
}

// ══════════════════════════════════════════
//  PESQUISA
// ══════════════════════════════════════════
if (searchContatos) {
  searchContatos.addEventListener("input", () => {
    const q = searchContatos.value.toLowerCase();
    todasConversas.forEach(({ el, nome }) => {
      el.style.display = nome.toLowerCase().includes(q) ? "flex" : "none";
    });
  });
}

// ══════════════════════════════════════════
//  BOTÃO VOLTAR MOBILE
// ══════════════════════════════════════════
if (backMobile) {
  backMobile.addEventListener("click", () => {
    sidebar.classList.remove("hidden");
    chatHeader.style.display       = "none";
    chatMessagesArea.style.display = "none";
    chatInputBar.style.display     = "none";
    chatEmpty.style.display        = "flex";
    conversaAtualId = null;
    if (unsubscribe) unsubscribe();
  });
}

// ══════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════
pedirPermissaoNotificacao();
carregarConversas();
verificarURL();