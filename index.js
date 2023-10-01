const express = require('express');
const fs = require('fs');

const app = express();
const port = 3000;

// Middleware para validar o token
const validateToken = (req, res, next) => {
  const token = req.query.token || req.headers['x-access-token'];
  if (token === process.env.token1 || token === process.env.token2) {
    next();
  } else {
    res.status(401).json({ message: 'Token inválido' });
  }
};

// Middleware para servir arquivos estáticos
app.use(express.static(__dirname));

// Rota raiz para redirecionar para a página de escolha de rota (frases.html)
app.get('/frases', (req, res) => {
  res.sendFile(__dirname + '/frases.html');
});


// Rota para listar todas as frases
app.get('/frases/listar', validateToken, (req, res) => {
  const frases = JSON.parse(fs.readFileSync('frases.json', 'utf8'));
  const formattedResponse = JSON.stringify({ frases }, null, 2);
  res.set('Content-Type', 'application/json');
  res.send(formattedResponse);
});

// Rota para obter uma frase aleatória
app.get('/frases/random', validateToken, (req, res) => {
  const frases = JSON.parse(fs.readFileSync('frases.json', 'utf8'));
  const randomIndex = Math.floor(Math.random() * frases.length);
  const randomFrase = frases[randomIndex];
  const formattedResponse = JSON.stringify({ frase: randomFrase }, null, 2);
  res.set('Content-Type', 'application/json');
  res.send(formattedResponse);
});

// Rota para pesquisar frases por termo
app.get('/frases/pesquisa', validateToken, (req, res) => {
  const searchTerm = req.query.termo.toLowerCase();
  const frases = JSON.parse(fs.readFileSync('frases.json', 'utf8'));
  const results = frases.filter((frase) =>
    frase.toLowerCase().includes(searchTerm)
  );

  if (results.length === 0) {
    const formattedResponse = JSON.stringify({ aviso: 'Nenhum resultado encontrado para o termo de pesquisa fornecido.' }, null, 2);
    res.set('Content-Type', 'application/json');
    res.send(formattedResponse);
  } else {
    const formattedResponse = JSON.stringify({ resultados: results }, null, 2);
    res.set('Content-Type', 'application/json');
    res.send(formattedResponse);
  }
});

app.listen(port, () => {
  console.log(`Servidor está rodando na porta ${port}`);
});
