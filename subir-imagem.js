const fs = require("fs");
const path = require("path");

// Caminho da pasta "lago-da-pedra"
const pastaImagens = path.join(__dirname, "imagens", "benedito-leite");

// Lê os arquivos da pasta
const arquivos = fs.readdirSync(pastaImagens);

// Filtra só imagens (png, jpg, jpeg)
const imagens = arquivos.filter(f => f.match(/\.(png|jpg|jpeg)$/i));

// Carrega JSON existente
let dados = JSON.parse(fs.readFileSync('./quiz/benedito-leite.json', 'utf8'));

// Atualiza o campo "imagens" apenas com os nomes
dados.imagens = imagens;

// Salva de volta no arquivo
fs.writeFileSync('./quiz/benedito-leite.json', JSON.stringify(dados, null, 2), 'utf8');

console.log("✅ Imagens da pasta adicionadas no JSON!");
