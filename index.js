const express = require("express");
const { Client } = require("pg");
const cors = require("cors");
const bodyParser = require("body-parser");
const config = require("./config");

const app = express();
const PORT = config.port || 3000; // Porta padrão caso não tenha configuração

// Middlewares
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

// Configuração do banco de dados PostgreSQL
const client = new Client({
  connectionString: config.urlConnection, // String de conexão vinda do arquivo config.js
});

// Conexão com o banco de dados
async function connectDB() {
  try {
    await client.connect();
    console.log("✅ Conectado ao banco de dados PostgreSQL");
  } catch (err) {
    console.error("❌ Erro ao conectar ao banco de dados:", err.message);
    process.exit(1); // Encerra o processo caso a conexão falhe
  }
}
connectDB();

// Rota de Teste
app.get("/", (req, res) => {
  console.log("✔ Rota GET / chamada com sucesso.");
  res.send("Ok – Servidor disponível.");
});

// Rota GET: Buscar todos os cadastros
app.get("/cadastros", async (req, res) => {
  try {
    console.log("✔ Rota GET /cadastros chamada.");
    const result = await client.query("SELECT * FROM Cadastro");
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("❌ Erro ao buscar cadastros:", err.message);
    res.status(500).json({ error: "Erro ao buscar cadastros" });
  }
});

// Rota POST: Criar um novo cadastro
app.post("/cadastros", async (req, res) => {
  const { nome, email, celular } = req.body;

  // Validação básica dos dados
  if (!nome || !email || !celular) {
    return res.status(400).json({ error: "Nome, email e celular são obrigatórios." });
  }

  try {
    console.log("✔ Rota POST /cadastros chamada. Dados recebidos:", req.body);
    const query = "INSERT INTO Cadastro (nome, email, celular) VALUES ($1, $2, $3) RETURNING *";
    const values = [nome, email, celular];

    const result = await client.query(query, values);
    console.log("✅ Novo cadastro adicionado:", result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("❌ Erro ao inserir cadastro:", err.message);
    res.status(500).json({ error: "Erro ao inserir cadastro" });
  }
});

// Rota PUT: Atualizar um cadastro por ID
app.put("/cadastros/:id", async (req, res) => {
  const { id } = req.params;
  const { nome, email, celular } = req.body;

  if (!nome || !email || !celular) {
    return res.status(400).json({ error: "Nome, email e celular são obrigatórios." });
  }

  try {
    console.log(`✔ Rota PUT /cadastros/${id} chamada. Dados recebidos:`, req.body);
    const query = "UPDATE Cadastro SET nome = $1, email = $2, celular = $3 WHERE id = $4 RETURNING *";
    const values = [nome, email, celular, id];

    const result = await client.query(query, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: `Cadastro com ID ${id} não encontrado.` });
    }

    console.log("✅ Cadastro atualizado:", result.rows[0]);
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("❌ Erro ao atualizar cadastro:", err.message);
    res.status(500).json({ error: "Erro ao atualizar cadastro" });
  }
});

// Rota DELETE: Deletar um cadastro por ID
app.delete("/cadastros/:id", async (req, res) => {
  const { id } = req.params;

  try {
    console.log(`✔ Rota DELETE /cadastros/${id} chamada.`);
    const query = "DELETE FROM Cadastro WHERE id = $1 RETURNING *";
    const result = await client.query(query, [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: `Cadastro com ID ${id} não encontrado.` });
    }

    console.log("✅ Cadastro deletado:", result.rows[0]);
    res.status(200).json({ message: `Cadastro ID ${id} deletado com sucesso.` });
  } catch (err) {
    console.error("❌ Erro ao deletar cadastro:", err.message);
    res.status(500).json({ error: "Erro ao deletar cadastro" });
  }
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor funcionando na porta ${PORT}`);
});

module.exports = app;

