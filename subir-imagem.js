const fs = require("fs");
const path = require("path");

// Vetor com os municípios que você quer processar
const municipios = ["benedito-leite", "buriti-bravo", "lago-da-pedra"];

// Para cada município...
municipios.forEach(municipio => {
  const pastaImagens = path.join(__dirname, "imagens", municipio);
  const arquivos = fs.readdirSync(pastaImagens);

  // Filtra só imagens
  const imagens = arquivos.filter(f => f.match(/\.(png|jpg|jpeg)$/i));

  // Lê o JSON do município correspondente
  const jsonPath = `./quiz/${municipio}.json`;
  let dados = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

  // Atualiza o campo imagens
  dados.imagens = imagens;

  // Salva de volta
  fs.writeFileSync(jsonPath, JSON.stringify(dados, null, 2), "utf8");

  console.log(`✅ Imagens adicionadas para ${municipio}`);
});
