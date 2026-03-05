document.getElementById("loginForm").addEventListener("submit", function(event) {
  event.preventDefault();

  const emailDigitado = document.getElementById("loginEmail").value.trim();
  const senhaDigitada = document.getElementById("loginSenha").value;

  // busca na lista de todos os utilizadores
  const utilizadores  = JSON.parse(localStorage.getItem("utilizadores")) || [];
  const usuarioEncontrado = utilizadores.find(
    u => u.email === emailDigitado && u.senha === senhaDigitada
  );

  if (usuarioEncontrado) {
    localStorage.setItem("usuarioLogado", JSON.stringify(usuarioEncontrado));
    window.location.href = "entrada.html";
  } else {
    alert("Email ou senha incorretos. Tente novamente.");
  }
});