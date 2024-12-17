const express = require("express");
const { Client } = require("pg");
const cors = require("cors");
const bodyparser = require("body-parser");
const config = require("./config");

const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyparser.json());

const conString = config.urlConnection;
const client = new Client(conString);

// Conexão com o banco de dados
client.connect((err) => {
    if (err) {
        return console.error("Não foi possível conectar ao banco.", err);
    }
    console.log("Conectado ao banco de dados PostgreSQL");
});
// Rota de Teste
app.get("/", (req, res) => {
    console.log("Response ok.");
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
            console.log("Rota: GET /cadastros");
        }
    });
});
// Rota GET: Buscar um cadastro específico por ID
app.get("/cadastros/:id", (req, res) => {
    const { id } = req.params;
    client.query("SELECT * FROM Cadastro WHERE id = $1", [id], (err, result) => {
        if (err) {
            console.error("Erro ao executar a query SELECT ID", err);
            return res.status(500).send("Erro ao buscar o cadastro.");
        }
        if (result.rowCount === 0) {
            res.status(404).send(`Nenhum cadastro encontrado para o ID: ${id}`);
        } else {
            res.json(result.rows[0]);
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
            console.log("Novo cadastro adicionado:", result.rows[0]);
        }
    );
});
// Rota PUT: Atualizar um cadastro por ID
app.put("/cadastros/:id", (req, res) => {
    const { id } = req.params;
    const { nome, email, celular } = req.body;

    client.query(
        "UPDATE Cadastro SET nome = $1, email = $2, celular = $3 WHERE id = $4 RETURNING *",
        [nome, email, celular, id],
        (err, result) => {
            if (err) {
                console.error("Erro ao executar a query UPDATE", err);
                return res.status(500).send("Erro ao atualizar o cadastro.");
            }
            if (result.rowCount === 0) {
                res.status(404).send(`Nenhum cadastro encontrado para o ID: ${id}`);
            } else {
                res.status(200).json(result.rows[0]);
                console.log("Cadastro atualizado:", result.rows[0]);
            }
        }
    );
});

// Rota DELETE: Deletar um cadastro por ID
app.delete("/cadastros/:id", (req, res) => {
    const { id } = req.params;

    client.query("DELETE FROM Cadastro WHERE id = $1 RETURNING *", [id], (err, result) => {
        if (err) {
            console.error("Erro ao executar a query DELETE", err);
            return res.status(500).send("Erro ao deletar o cadastro.");
        }
        if (result.rowCount === 0) {
            res.status(404).send(`Nenhum cadastro encontrado para o ID: ${id}`);
        } else {
            res.status(200).json({ message: `Cadastro ID ${id} deletado com sucesso.` });
            console.log("Cadastro deletado:", result.rows[0]);
        }
    });
});

// O método listen deve ser o último da API
app.listen(config.port, () => {
    console.log(`Servidor funcionando na porta ${config.port}`);
});

module.exports = app;
