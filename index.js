const express = require("express");
const { Client } = require("pg");
const cors = require("cors");
const bodyparser = require("body-parser");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyparser.json());

// Configuração do banco de dados PostgreSQL
const client = new Client({
  connectionString: process.env.DATABASE_URL || "sua-string-de-conexao"
});

// Conexão com o banco de dados
client.connect((err) => {
  if (err) {
    return console.error("Não foi possível conectar ao banco.", err);
  }
  console.log("Conectado ao banco de dados PostgreSQL");
});

// Rota de teste
app.get("/", (req, res) => {
  res.send("Ok – Servidor disponível.");
});

// Rota GET: Buscar todos os cadastros
app.get("/cadastros", (req, res) => {
  client.query("SELECT * FROM Cadastro", (err, result) => {
    if (err) {
      console.error("Erro ao executar a query SELECT", err);
      res.status(500).send("Erro ao buscar os dados.");
    } else {
      res.json(result.rows);
    }
  });
});

// Rota POST: Criar um novo cadastro
app.post("/cadastros", (req, res) => {
  const { nome, email, celular } = req.body;

  client.query(
    "INSERT INTO Cadastro (nome, email, celular) VALUES ($1, $2, $3) RETURNING *",
    [nome, email, celular],
    (err, result) => {
      if (err) {
        console.error("Erro ao executar a query INSERT", err);
        return res.status(500).send("Erro ao inserir o cadastro.");
      }
      res.status(201).json(result.rows[0]);
    }
  );
});

// Inicia o servidor na porta especificada
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

