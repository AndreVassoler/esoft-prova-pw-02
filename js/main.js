const url = "http://servicodados.ibge.gov.br/api/v3/noticias"

const filter = document.querySelector("container-filter")
const dialog = document.querySelector(".modal-filtro");
const dialogFechar = document.querySelector(".botao-fechar");
const dialogAplicar = document.querySelector(".botao-aplica-filtro");

dialogAplicar.addEventListener("click", () => {
    atualizarFilter();
    dialog.close();
});

filter.addEventListener("click", () => {
    dialog.showModal();
});

dialogFechar.addEventListener("click", () => {
    dialog.close();
});

const formDeBusca = document.querySelector(".form-pesquisa");
const inputDeBusca = document.querySelector("input");
let  busca = inputDeBusca.value || "";

formDeBusca.addEventListener("submit", (event) => {
    event.preventDefault();
    pagina = 1;
    busca = inputDeBusca.value;

    atualizaUrl();
    buscaNoticia();
});

let tipo = document.querySelector("#tipo");
let qtd = document.querySelector("#quantidade");
let de = document.querySelector("#de");
let ate = document.querySelector("#ate");

const ListaNoticia = document.querySelector(".lista-noticia");

const listaPagina = document.querySelector(".lista-pagina");
let paginaAtual = 1;
let totalPagina = 1;

function criarNoticia(noticia) {
    const li = document.createElement("li");
    const imagem = document.createElement("img");
    const imagemContainer = JSON.parse(noticia.imagens);

    imagem.src = `https://agenciadenoticias.ibge.gov.br/${imagemObj.image_intro}`;

    const titulo = document.createElement("h2");
    titulo.textContent = noticia.titulo;

    const intro = document.createElement("p");
    intro.textContent = noticia.introtext;

    const editores = document.createElement("span");
    editores.textContent = noticia.editores ? noticia.editores.split(";").masp((editores) => `#${editores}`).join(" ") : "";

    const publicado = document.createElement("span");
    publicado.textContent = calcularDataPublicado(noticia.data_publicacao);

    const botaoLeiaMais = document.createElement("button");
    botaoLeiaMais.textContent = "Leia mais";
    botaoLeiaMais.addEventListener("click", () => {
        window.open(noticia.url, "_blank");
    });


    

  const noticia = document.createElement("div");
  noticia.classList.add("noticia");

  const noticiaConteudo = document.createElement("div");
  noticiaConteudo.classList.add("noticia-conteudo");

  const noticiaImagem = document.createElement("div");
  noticiaImagem.classList.add("noticia-imagem");

  const conteudoInformacao = document.createElement("div");
  conteudoInformacao.classList.add("conteudo-info");

  const conteudoPublicado = document.createElement("div");
  conteudoPublicado.classList.add("conteudo-publicado");

  const leiaMais = document.createElement("div");
  leiaMais.classList.add("leia-mais");

  conteudoInformacao.appendChild(titulo);
  conteudoInformacao.appendChild(intro);
  conteudoPublicado.appendChild(editores);
  conteudoPublicado.appendChild(publicado);
  leiaMais.appendChild(botaoLeiaMais);

  noticiaConteudo.appendChild(conteudoInformacao);
  noticiaConteudo.appendChild(conteudoPublicado);
  noticiaConteudo.appendChild(leiaMais);

  noticiaImagem.appendChild(imagem);

  noticia.appendChild(noticiaImagem);
  noticia.appendChild(noticiaConteudo);

  li.appendChild(noticia);

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
/**
 * Função responsável por paginar as notícias.
 */
function paginarNoticias() {
  listaPagina.innerHTML = "";

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
  listaPagina.appendChild(primeiraPagina);

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
  listaPagina.appendChild(paginaAnterior);

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
    listaPagina.appendChild(li);
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
  listaPagina.appendChild(proximaPagina);

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
  listaPagina.appendChild(ultimaPagina);
}








