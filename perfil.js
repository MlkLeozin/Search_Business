window.addEventListener("DOMContentLoaded", function() {
  const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));

  // Verifica se está logado
  if (!usuarioLogado) {
    alert("Você precisa estar logado para acessar o perfil.");
    window.location.href = "log.html";
    return;
  }

  // Mostra informações do perfil
  document.getElementById("perfilNome").textContent = usuarioLogado.nome;
  document.getElementById("perfilEmail").textContent = usuarioLogado.email;

  // Botão editar
  document.getElementById("editBtn").addEventListener("click", function() {
    document.getElementById("editForm").style.display = "block";
    document.getElementById("editNome").value = usuarioLogado.nome;
    document.getElementById("editEmail").value = usuarioLogado.email;
  });

  // Botão salvar edição
  document.getElementById("saveBtn").addEventListener("click", function() {
    const novoNome = document.getElementById("editNome").value;
    const novoEmail = document.getElementById("editEmail").value;

    const usuarioAtualizado = {
      nome: novoNome,
      email: novoEmail,
      senha: usuarioLogado.senha // mantém a senha original
    };

    // Atualiza no localStorage
    localStorage.setItem("usuario", JSON.stringify(usuarioAtualizado));
    localStorage.setItem("usuarioLogado", JSON.stringify(usuarioAtualizado));

    alert("Informações atualizadas com sucesso!");
    window.location.reload(); // recarrega para mostrar os novos dados
  });

  // Botão logout
  document.getElementById("logoutBtn").addEventListener("click", function() {
    localStorage.removeItem("usuarioLogado");
    alert("Você saiu da conta.");
    window.location.href = "saida.html";
  });
});


document.getElementById("themeBtn").addEventListener("click", function() {
  // Alterna entre os temas
  if (document.body.classList.contains("light")) {
    document.body.classList.remove("light");
    document.body.classList.add("dark");
    localStorage.setItem("tema", "dark"); // salva preferência
  } else {
    document.body.classList.remove("dark");
    document.body.classList.add("light");
    localStorage.setItem("tema", "light"); // salva preferência
  }
});
// Ao carregar a página, aplica o último tema escolhido
window.addEventListener("DOMContentLoaded", function() {
  const temaSalvo = localStorage.getItem("tema");
  if (temaSalvo) {
    document.body.classList.remove("light", "dark");
    document.body.classList.add(temaSalvo);
  }
});
document.getElementById("backBtn").addEventListener("click", function() {
  window.history.back(); // volta para a página anterior
});

const uploadBtn = document.getElementById("uploadBtn");
const uploadFoto = document.getElementById("uploadFoto");
const fotoPerfil = document.getElementById("fotoPerfil");
const deleteBtn = document.getElementById("deleteBtn"); // botão de deletar

// Ao clicar no botão de upload, abre o seletor de arquivos
uploadBtn.addEventListener("click", () => {
  uploadFoto.click();
});

// Quando o usuário escolhe uma foto
uploadFoto.addEventListener("change", () => {
  const file = uploadFoto.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const imgData = e.target.result;
      fotoPerfil.src = imgData; // atualiza a imagem
      localStorage.setItem("fotoPerfil", imgData); // salva no localStorage
    };
    reader.readAsDataURL(file);
  }
});

// Carregar a foto salva ao abrir a página
window.addEventListener("load", () => {
  const savedFoto = localStorage.getItem("fotoPerfil");
  if (savedFoto) {
    fotoPerfil.src = savedFoto;
  }
});

// Botão de deletar foto
deleteBtn.addEventListener("click", () => {
  fotoPerfil.src = ""; // remove da tela
  localStorage.removeItem("fotoPerfil"); // remove do localStorage
});


const publicarBtn = document.getElementById("publicarBtn");
const novaPublicacao = document.getElementById("novaPublicacao");
const listaPublicacoes = document.getElementById("listaPublicacoes");

publicarBtn.addEventListener("click", () => {
  const texto = novaPublicacao.value.trim();

  if (texto !== "") {
    // Remove mensagem "sem publicações" se existir
    const semPublicacoes = document.querySelector(".sem-publicacoes");
    if (semPublicacoes) {
      semPublicacoes.remove();
    }

    // Cria novo item na lista
    const li = document.createElement("li");
    li.textContent = texto;
    listaPublicacoes.appendChild(li);

    // Limpa textarea
    novaPublicacao.value = "";
  }
});

