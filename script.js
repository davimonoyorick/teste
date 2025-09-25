document.addEventListener("DOMContentLoaded", function () {
  // --- SELEÇÃO DOS ELEMENTOS ---
  const caminhao = document.getElementById("caminhao");
  const startMenu = document.getElementById("start-menu-overlay");
  const startGameBtn = document.getElementById("start-game-btn");
  const quizOverlay = document.getElementById("quiz-modal-overlay");
  const quizCityName = document.getElementById("quiz-city-name");
  const quizPergunta = document.getElementById("quiz-pergunta");
  const quizOpcoes = document.getElementById("quiz-opcoes");
  const quizFeedback = document.getElementById("quiz-feedback");
  const quizImagem = document.getElementById("quiz-imagem");
  const quizCloseBtn = document.getElementById("quiz-close-btn");
  const quizImgTag = document.getElementById("quiz-img");
  const travelBarContainer = document.getElementById("travel-bar-container");
  const travelBarProgress = document.getElementById("travel-bar-progress");
  const travelBarTruck = document.getElementById("travel-bar-truck");

  let mapaSVG = null;
  let todosOsCaminhosDeCidade = null;

  // --- VARIÁVEIS DE CONTROLE ---
  const quizDuration = 10;
  let cidadeDeDestino = null;
  let perguntaAtual = null;
  let quizAtivo = false;
  let cidadeIdAtual = null;
  let nomeCidadeAtual = null;

  // --- POSIÇÃO INICIAL DO CAMINHÃO ---
  caminhao.style.transform = `translate(${window.innerWidth * 0.45}px, ${window.innerHeight * 0.20}px)`;

  // --- LÓGICA DO JOGO ---

  startGameBtn.addEventListener("click", function () {
    startMenu.classList.add("hidden");
  });

  const mapContainer = document.getElementById("map-container");
  fetch("components/map.svg")
    .then((response) => response.text())
    .then((svgText) => {
      mapContainer.innerHTML = svgText;
      mapaSVG = document.querySelector("#game-container svg");
      todosOsCaminhosDeCidade = document.querySelectorAll(".cidade-path");
      inicializarEventos();
    })
    .catch((error) => console.error("Erro ao carregar SVG:", error));

  function inicializarEventos() {
    if (!mapaSVG) return;

    mapaSVG.addEventListener("click", function (event) {
      const elementoClicado = event.target.closest(".cidade-path");
      if (elementoClicado) {
        const cidadeId = elementoClicado.id;
        if (cidadeId) {
          // --- Centraliza o caminhão no clique ---
          const offsetX = caminhao.offsetWidth / 2;
          const offsetY = caminhao.offsetHeight / 2;

          caminhao.style.transform = `translate(${event.clientX - offsetX}px, ${event.clientY - offsetY}px)`;

          cidadeDeDestino = elementoClicado;
        }
      }
    });

    todosOsCaminhosDeCidade.forEach((caminho) => {
      caminho.addEventListener("mouseenter", function () {
        if (!quizAtivo) caminho.style.cursor = "pointer";
      });
    });
  }

  async function iniciarQuiz(caminhoDoSVG) {
    const cidadeId = caminhoDoSVG.id;
    cidadeIdAtual = cidadeId;
    const filePath = `quiz/${cidadeId}.json`;

    try {
      const response = await fetch(filePath);
      if (!response.ok) throw new Error(`Arquivo não encontrado: ${filePath}`);

      const dadosCidade = await response.json();
      nomeCidadeAtual = dadosCidade.nome;

      quizOverlay.style.display = "flex";
      quizPergunta.style.display = "block";
      quizOpcoes.style.display = "block";
      quizFeedback.style.display = "block";
      quizFeedback.textContent = "";
      quizFeedback.className = "";
      quizOpcoes.classList.remove("respondido");
      quizImagem.style.display = "none";

      quizCityName.textContent = ` ${dadosCidade.nome}`;
      const perguntas = dadosCidade.perguntas;
      perguntaAtual = perguntas[Math.floor(Math.random() * perguntas.length)];

      exibirPergunta();
      startQuizTimer();
    } catch (error) {
      console.error("Erro ao iniciar o quiz:", error);
      alert(`Não foi possível carregar o quiz para "${cidadeId}".`);
      mapaSVG.style.pointerEvents = "auto";
    }
  }

  function exibirPergunta() {
    quizPergunta.textContent = perguntaAtual.pergunta;
    quizOpcoes.innerHTML = "";

    perguntaAtual.opcoes.forEach((opcao) => {
      const li = document.createElement("li");
      li.textContent = opcao;
      li.addEventListener("click", verificarResposta);
      quizOpcoes.appendChild(li);
    });
  }

  function verificarResposta(event) {
    if (quizOpcoes.classList.contains("respondido")) return;

    quizAtivo = false;
    quizOpcoes.classList.add("respondido");

    const escolha = event.target.textContent;
    const acertou = escolha === perguntaAtual.respostaCorreta;

    quizOpcoes.querySelectorAll("li").forEach((li) => {
      if (li.textContent === perguntaAtual.respostaCorreta)
        li.classList.add("correta");
      else if (li.textContent === escolha)
        li.classList.add("incorreta-escolhida");
    });

    if (acertou) {
      setTimeout(() => {
        const cidadeIdAtual = obterCidadeIdAtual();
        if (cidadeIdAtual) {
          atualizarImagemCidade(cidadeIdAtual, () => {
            quizCityName.textContent = `Obrigado! A unidade móvel chegou em ${nomeCidadeAtual}`;
            quizPergunta.style.display = "none";
            quizOpcoes.style.display = "none";
            quizFeedback.style.display = "none";
            travelBarContainer.style.display = "none";
            quizImagem.style.display = "block";
          });
        }
      }, 3000);
    }
  }

  function atualizarImagemCidade(cidadeId, onImageLoaded) {
    fetch(`quiz/${cidadeId}.json`)
      .then((response) => response.json())
      .then((dadosCidade) => {
        if (dadosCidade.imagens && dadosCidade.imagens.length > 0) {
          const indiceImagem = Math.floor(
            Math.random() * dadosCidade.imagens.length
          );
          let caminhoImagem = dadosCidade.imagens[indiceImagem];

          if (!caminhoImagem.startsWith("imagens/")) {
            caminhoImagem = `imagens/${cidadeId}/${caminhoImagem}`;
          }

          quizImgTag.alt = `Imagem de destaque - ${dadosCidade.nome}`;

          quizImgTag.onload = () => onImageLoaded();
          quizImgTag.onerror = () => {
            console.error("Erro ao carregar a imagem:", caminhoImagem);
            quizImagem.style.display = "none";
          };
          quizImgTag.src = caminhoImagem;
        } else {
          quizImagem.style.display = "none";
        }
      })
      .catch((error) => {
        console.error("Erro ao carregar dados da cidade:", error);
        quizImagem.style.display = "none";
      });
  }

  function fecharQuiz() {
    quizOverlay.style.display = "none";
    startMenu.classList.remove("hidden");

    quizAtivo = false;
    travelBarContainer.style.display = "none";
    mapaSVG.style.pointerEvents = "auto";
  }

  quizCloseBtn.addEventListener("click", fecharQuiz);

  function startQuizTimer() {
    quizAtivo = true;
    travelBarContainer.style.display = "flex";
    travelBarProgress.style.width = "100%";
    travelBarTruck.style.left =
      travelBarContainer.offsetWidth - travelBarTruck.offsetWidth + "px";
    const startTime = Date.now();

    function animate() {
      if (!quizAtivo) return;

      const elapsed = (Date.now() - startTime) / 1000;
      const remaining = Math.max(quizDuration - elapsed, 0);
      const percent = (remaining / quizDuration) * 100;

      if (percent > 60) {
        travelBarProgress.style.backgroundColor = "#28a745";
      } else if (percent > 25) {
        travelBarProgress.style.backgroundColor = "#ffc107";
      } else {
        travelBarProgress.style.backgroundColor = "#dc3545";
      }

      travelBarProgress.style.width = percent + "%";

      const maxWidth =
        travelBarContainer.offsetWidth - travelBarTruck.offsetWidth;
      travelBarTruck.style.left = maxWidth * (remaining / quizDuration) + "px";

      if (remaining > 0) {
        requestAnimationFrame(animate);
      } else {
        quizFeedback.textContent = "⏳ Tempo esgotado!";
        quizFeedback.className = "feedback-incorreto";
        quizOpcoes.classList.add("respondido");
        quizAtivo = false;
      }
    }
    requestAnimationFrame(animate);
  }

  caminhao.addEventListener("transitionend", function () {
    if (cidadeDeDestino) {
      iniciarQuiz(cidadeDeDestino);
      cidadeDeDestino = null;
    }
  });

  function obterCidadeIdAtual() {
    return cidadeIdAtual;
  }
});
