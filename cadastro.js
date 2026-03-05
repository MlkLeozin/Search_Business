document.getElementById("cadastroForm").addEventListener("submit", function(event) {
  event.preventDefault();

  const nome  = document.getElementById("users").value.trim();
  const email = document.getElementById("emal").value.trim();
  const senha = document.getElementById("senha").value;

  // busca lista de todos os utilizadores
  const utilizadores = JSON.parse(localStorage.getItem("utilizadores")) || [];

  // verifica se email já existe
  const jaExiste = utilizadores.find(u => u.email === email);
  if (jaExiste) {
    alert("Este email já está cadastrado. Faça login.");
    window.location.href = "log.html";
    return;
  }

  const novoUtilizador = { nome, email, senha };
  utilizadores.push(novoUtilizador);

  localStorage.setItem("utilizadores", JSON.stringify(utilizadores));
  alert("Cadastro realizado com sucesso!");
  window.location.href = "log.html";
});

