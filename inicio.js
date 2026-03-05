function pesquisar(){
    let termo = document.getElementById("searchInput").value;
    
    if(termo){
        window.location.href="pesquisa.htmt?q=" + encodeURIComponent(termo);
    }else{
        alert("Digite algo para pesquisar!");
    }
}
const anoAtual = new Date().getFullYear();
document.getElementById("ano").textContent = anoAtual;
//login
window.addEventListener("DOMContentLoaded", function() {
  const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
  if (!usuarioLogado) {
    alert("Você precisa estar logado para acessar esta página.");
    window.location.href = "index.html"; // volta para login
  } else {
    document.getElementById("bemVindo").textContent = "Bem-vindo, " + usuarioLogado.nome;
  }
});
document.getElementById("logoutBtn").addEventListener("click", function() {
 // apaga login
  window.location.href = "saida.html"; // volta para login
});
// pega o botao da barra de pesquisa (Disperta a barra pelo btn)
const botao = document.getElementById("btnBuscar"); 
  // Pega a barra de pesquisa
  const barra = document.getElementById("barraPesquisa");
  // Evento de clique
  botao.addEventListener("click", (event) => {
    event.preventDefault(); // evita que o link recarregue a página
    barra.focus();          // coloca o foco na barra de pesquisa
  });
// Atualiza o ano automaticamente
document.getElementById("ano").textContent = new Date().getFullYear();

// Barra de pesquisa
const trabalhos = [
  { titulo: "Instalação Elétrica Simples", descricao: "Mini job: instalação de tomadas e revisão básica.", url: "eletrica.html" },
  { titulo: "Pedreiro", descricao: "Serviços de construção e reparo.", url: "pedreiro.html" }, // esses destinos ainda nao exitem
  { titulo: "Taxista de moto", descricao: "Transporte rápido e seguro.", url: "taxista.html" }// ou seja ainda nao criei
];

function pesquisar() {
  event.preventDefault(); // evita recarregar a página
  const query = document.getElementById("barraPesquisa").value.toLowerCase();
  const resultadosDiv = document.getElementById("resultadosBusca");
  resultadosDiv.innerHTML = "";

  // Filtra os trabalhos que contêm o termo pesquisado
  const resultados = trabalhos.filter(t => 
    t.titulo.toLowerCase().includes(query) || 
    t.descricao.toLowerCase().includes(query)
  );

  if (resultados.length === 0) {
    resultadosDiv.innerHTML = "<p>Nenhum resultado encontrado.</p>";
  } else {
    resultados.forEach(t => {
      const item = document.createElement("div");
      item.className = "resultado";
      item.innerHTML = `
        <h3><a href="${t.url}">${t.titulo}</a></h3>
        <p>${t.descricao}</p>
      `;
      resultadosDiv.appendChild(item);
    });
  }
}
const barraPesquisa = document.getElementById("barraPesquisa");
const resultadosDiv = document.getElementById("resultadosBusca");
// Quando a barra de pesquisa ganha foco → mostra resultados
barraPesquisa.addEventListener("focus", () => {
  resultadosDiv.style.display = "block";
});
// Quando perde foco → esconde resultados
barraPesquisa.addEventListener("blur", () => {
  // pequeno atraso para permitir clique nos links antes de esconder
  setTimeout(() => {
    resultadosDiv.style.display = "none";
  }, 200);
});
