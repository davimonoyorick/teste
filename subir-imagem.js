const fs = require("fs");
const path = require("path");

// Lista de municípios a processar
const municipios = ["barra-do-corda"];

municipios.forEach(municipio => {
  const pastaImagens = path.join(__dirname, "imagens", municipio);
  const jsonPath = path.join(__dirname, "quiz", `${municipio}.json`);

  // Verifica se a pasta de imagens existe
  if (!fs.existsSync(pastaImagens)) {
    console.warn(`⚠️ Pasta de imagens não encontrada: ${municipio}`);
    return;
  }

  // Verifica se o JSON existe
  if (!fs.existsSync(jsonPath)) {
    console.warn(`⚠️ JSON do município não encontrado: ${municipio}`);
    return;
  }

  // Lê os arquivos da pasta e filtra apenas imagens
  const arquivos = fs.readdirSync(pastaImagens);
  const imagens = arquivos.filter(f => f.match(/\.(png|jpg|jpeg)$/i));

  // Lê o JSON existente
  const dados = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

  // Só adiciona imagens se o vetor estiver vazio ou não existir
  if (!dados.imagens || dados.imagens.length === 0) {
    dados.imagens = imagens;
    fs.writeFileSync(jsonPath, JSON.stringify(dados, null, 2), "utf8");
    console.log(`✅ Imagens adicionadas para ${municipio}`);
  } else {
    console.log(`ℹ️ O vetor "imagens" de ${municipio} já possui conteúdo. Nenhuma alteração feita.`);
  }
});
