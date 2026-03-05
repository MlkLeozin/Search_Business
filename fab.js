// conta mensagens não lidas de todas as conversas
function contarNaoLidas() {
  const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
  const usuarioAtual  = usuarioLogado?.nome || usuarioLogado?.email;
  if (!usuarioAtual) return;

  const lista  = JSON.parse(localStorage.getItem("sb_conversas_" + usuarioAtual)) || [];
  let total    = 0;

  lista.forEach(contato => {
    const convId    = [usuarioAtual, contato].sort().join("__");
    const mensagens = JSON.parse(localStorage.getItem(convId)) || [];
    const lidas     = parseInt(localStorage.getItem("lidas_" + convId) || "0");
    total += Math.max(0, mensagens.length - lidas);
  });

  const badge = document.getElementById("fabBadge");
  if (!badge) return;

  if (total > 0) {
    badge.textContent = total > 99 ? "99+" : total;
    badge.style.display = "flex";
  } else {
    badge.style.display = "none";
  }
}

contarNaoLidas();
setInterval(contarNaoLidas, 3000);