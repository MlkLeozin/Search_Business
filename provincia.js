function  irParaPagina(valor) {
    if(valor){
        window.location.href= valor;
    }
}
document.getElementById("logoutBtn").addEventListener("click", function() {
  // apaga login
  window.location.href = "saida.html"; // volta para login
});
const anoAtual = new Date().getFullYear();
document.getElementById("ano").textContent = anoAtual;

// Barra de pesquisa
// Exemplo de dados simulados (pode vir de um banco de dados ou JSON)
const trabalhos = [
  { titulo: "Instalação Elétrica Simples", descricao: "Mini job: instalação de tomadas e revisão básica.", url: "eletrica.html" },
  { titulo: "Pedreiro", descricao: "Serviços de construção e reparo.", url: "pedreiro.html" },
  { titulo: "Taxista de moto", descricao: "Transporte rápido e seguro.", url: "taxista.html" }
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
