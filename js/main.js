// Variavel para a URL da API
const url = "https://servicodados.ibge.gov.br/api/v3/noticias";

// Variáveis para os elementos do filtro
const filtro = document.querySelector(".icone-filtro  ");
const dialog = document.querySelector(".dialog-filtro");
const dialogFechar = document.querySelector(".fechar-filtro");
const dialogAplicar = document.querySelector(".aplicar-filtro");

// Eventos para abrir, fechar e aplicar o dialog de filtro
dialogAplicar.addEventListener("click", () => {
  atualizarFiltros();
  dialog.close();
});

filtro.addEventListener("click", () => {
  dialog.showModal();
});

dialogFechar.addEventListener("click", () => {
  dialog.close();
});

// Variáveis para o campo de busca
const formBusca = document.querySelector(".form-busca");
const inputBusca = formBusca.querySelector("input");
let busca = inputBusca.value || "";

// Evento para buscar as notícias quando o formulário de busca é submetido
// Também é feito a atualização da url
formBusca.addEventListener("submit", (event) => {
  event.preventDefault();

  paginaAtual = 1;
  busca = inputBusca.value;

  atualizarUrl();
  buscarNoticias();
});

// Váriaveis para os campos de filtro
let tipo = document.querySelector("#tipo");
let qtd = document.querySelector("#quantidade");
let de = document.querySelector("#de");
let ate = document.querySelector("#ate");

// Variavel que armazena a UL que irá conter as notícias
const listaNoticias = document.querySelector(".lista-noticia");

// Variavel para a lista de paginas
const listaPaginacao = document.querySelector(".lista-pagina");
let paginaAtual = 1;
let totalPaginas = 1;

// Função para criar o elemento da notícia LI
function criarNoticia(noticia) {
  const li = document.createElement("li");

  const imagem = document.createElement("img");
  const imagemObj = JSON.parse(noticia.imagens);
  imagem.src = `https://agenciadenoticias.ibge.gov.br/${imagemObj.image_intro}`;

  const titulo = document.createElement("h2");
  titulo.textContent = noticia.titulo;

  const introducao = document.createElement("p");
  introducao.textContent = noticia.introducao;

  const editorias = document.createElement("span");
  editorias.textContent = noticia.editorias
    ? noticia.editorias
        .split(";")
        .map((editoria) => `#${editoria}`)
        .join(" ")
    : "";

  const publicacao = document.createElement("span");
  publicacao.textContent = calcularDataPublicacao(noticia.data_publicacao);

  const botaoLerMais = document.createElement("button");
  botaoLerMais.textContent = "Ler Mais";
  botaoLerMais.addEventListener("click", () => {
    window.open(noticia.link, "_blank");
  });

  // Criar a estrutura da notícia
  const divNoticia = document.createElement("div");
  divNoticia.classList.add("noticia");

  const divNoticiaConteudo = document.createElement("div");
  divNoticiaConteudo.classList.add("noticia-conteudo");

  const divNoticiaImg = document.createElement("div");
  divNoticiaImg.classList.add("noticia-imagem");

  const divConteudoInfo = document.createElement("div");
  divConteudoInfo.classList.add("conteudo-info");

  const divConteudoPublicado = document.createElement("div");
  divConteudoPublicado.classList.add("conteudo-publicado");

  const divLeiaMais = document.createElement("div");
  divLeiaMais.classList.add("leia-mais");

  divConteudoInfo.appendChild(titulo);
  divConteudoInfo.appendChild(introducao);
  divConteudoPublicado.appendChild(editorias);
  divConteudoPublicado.appendChild(publicacao);
  divLeiaMais.appendChild(botaoLerMais);

  divNoticiaConteudo.appendChild(divConteudoInfo);
  divNoticiaConteudo.appendChild(divConteudoPublicado);
  divNoticiaConteudo.appendChild(divLeiaMais);

  divNoticiaImg.appendChild(imagem);

  divNoticia.appendChild(divNoticiaImg);
  divNoticia.appendChild(divNoticiaConteudo);

  li.appendChild(divNoticia);

  return li;
}

// Função para calcular a data de publicação
function calcularDataPublicacao(data) {
  const dataAtual = new Date();
  const dataPublicacao = new Date(
    data.replace(
      /(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2}):(\d{2})/,
      "$2/$1/$3 $4:$5:$6"
    )
  );
  const diferencaTempo = Math.abs(dataAtual - dataPublicacao);
  const diferencaDias = Math.ceil(diferencaTempo / (1000 * 60 * 60 * 24));
  if (diferencaDias === 0) {
    return "Publicado hoje";
  } else if (diferencaDias === 1) {
    return "Publicado ontem";
  } else {
    return `Publicado há ${diferencaDias} dias`;
  }
}

// Função para atualizar as variáveis de filtro quando o dialog é aplicado
// Também é feito a busca das notícias e a atualização da url
function atualizarFiltros() {
  tipo = document.querySelector("#tipo");
  qtd = document.querySelector("#quantidade");
  de = document.querySelector("#de");
  ate = document.querySelector("#ate");
  paginaAtual = 1;

  buscarNoticias();
  atualizarUrl();
}

// Atualizar url com os filtros
function atualizarUrl() {
  const params = new URLSearchParams();

  busca !== "" && params.append("busca", busca);
  tipo.value !== "" && params.append("tipo", tipo.value);
  de.value !== "" && params.append("de", de.value);
  ate.value !== "" && params.append("ate", ate.value);
  params.append("qtd", qtd.value);
  params.append("page", paginaAtual);

  window.history.pushState({}, "", `?${params}`);
}

// Atualizar as variáveis de filtro quando a página é carregada pela primeira vez e tiver dados na url
document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);

  busca = urlParams.get("busca") || "";
  tipo.value = urlParams.get("tipo") || "";
  qtd.value = urlParams.get("qtd") || 10;
  de.value = urlParams.get("de") || "";
  ate.value = urlParams.get("ate") || "";
  paginaAtual = parseInt(urlParams.get("page")) || 1;

  if (busca !== "") {
    inputBusca.value = busca;
  }

  buscarNoticias();
});

// Função para buscar as notícias da API do IBGE
function buscarNoticias() {
  const params = new URLSearchParams();

  busca !== "" && params.append("busca", busca);
  tipo.value !== "" && params.append("tipo", tipo.value);
  de.value !== "" && params.append("de", de.value);
  ate.value !== "" && params.append("ate", ate.value);
  params.append("qtd", qtd.value);
  params.append("page", paginaAtual);

  fetch(`${url}?${params}`)
    .then((response) => response.json())
    .then((data) => {
      listaNoticias.innerHTML = "";
      data.items.forEach((noticia) => {
        listaNoticias.appendChild(criarNoticia(noticia));
      });
      totalPaginas = data.totalPages;
      paginarNoticias();
    });
}

// Função para paginar as notícias e criar os botões de paginação
function paginarNoticias() {
  listaPaginacao.innerHTML = "";

  const paginas = [];

  for (let i = 1; i <= totalPaginas; i++) {
    paginas.push(i);
  }

  let paginasVisiveis = [];

  if (totalPaginas <= 10) {
    paginasVisiveis = paginas;
  } else {
    let inicio = paginaAtual - 4;
    let fim = paginaAtual + 5;

    if (inicio < 1) {
      inicio = 1;
      fim = 10;
    }

    if (fim > totalPaginas) {
      fim = totalPaginas;
      inicio = totalPaginas - 9;
    }

    for (let i = inicio; i <= fim; i++) {
      paginasVisiveis.push(i);
    }
  }

  // Botão para primeira página
  const primeiraPagina = document.createElement("li");
  const botaoPrimeiraPagina = document.createElement("button");
  botaoPrimeiraPagina.textContent = "<<";
  botaoPrimeiraPagina.addEventListener("click", () => {
    paginaAtual = 1;
    buscarNoticias();
    atualizarUrl();
  });

  primeiraPagina.appendChild(botaoPrimeiraPagina);
  listaPaginacao.appendChild(primeiraPagina);

  // Botão para página anterior
  const paginaAnterior = document.createElement("li");
  const botaoPaginaAnterior = document.createElement("button");
  botaoPaginaAnterior.textContent = "<";
  botaoPaginaAnterior.addEventListener("click", () => {
    paginaAtual = paginaAtual - 1;
    buscarNoticias();
    atualizarUrl();
  });

  paginaAnterior.appendChild(botaoPaginaAnterior);
  listaPaginacao.appendChild(paginaAnterior);

  // Paginas que ficam visiveis
  paginasVisiveis.forEach((pagina) => {
    const li = document.createElement("li");
    const botao = document.createElement("button");
    botao.textContent = pagina;
    botao.addEventListener("click", () => {
      paginaAtual = pagina;
      buscarNoticias();
      atualizarUrl();
    });
    if (pagina === paginaAtual) {
      botao.style.backgroundColor = "#4682b4";
      botao.style.color = "#ffffff";
    }
    li.appendChild(botao);
    listaPaginacao.appendChild(li);
  });

  // Botão para próxima página
  const proximaPagina = document.createElement("li");
  const botaoProximaPagina = document.createElement("button");
  botaoProximaPagina.textContent = ">";
  botaoProximaPagina.addEventListener("click", () => {
    paginaAtual = paginaAtual + 1;
    buscarNoticias();
    atualizarUrl();
  });

  proximaPagina.appendChild(botaoProximaPagina);
  listaPaginacao.appendChild(proximaPagina);

  // Botão para última página
  const ultimaPagina = document.createElement("li");
  const botaoUltimaPagina = document.createElement("button");
  botaoUltimaPagina.textContent = ">>";
  botaoUltimaPagina.addEventListener("click", () => {
    paginaAtual = totalPaginas;
    buscarNoticias();
    atualizarUrl();
  });

  ultimaPagina.appendChild(botaoUltimaPagina);
  listaPaginacao.appendChild(ultimaPagina);
}

document.addEventListener("DOMContentLoaded", () => {
  const filtroCount = document.querySelector(".icone-filtro-contador");
  const tipoSelect = document.getElementById("tipo");
  const quantidadeSelect = document.getElementById("quantidade");
  const deInput = document.getElementById("de");
  const ateInput = document.getElementById("ate");
  const form = document.querySelector(".filtro-formulario");

  function updateFiltroCount() {
    let count = 0;

    if (tipoSelect.value !== "") count++;
    if (quantidadeSelect.value !== "0" && quantidadeSelect.value !== "")
      count++;
    if (deInput.value) count++;
    if (ateInput.value) count++;

    filtroCount.textContent = count;
  }

  form.addEventListener("change", updateFiltroCount);
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    updateFiltroCount();
  });

  updateFiltroCount();
});