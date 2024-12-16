const express = require("express");
const { Client } = require("pg");
const cors = require("cors");
const bodyparser = require("body-parser");
const config = require("./config");

const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyparser.json());

var conString = config.urlConnection;
var client = new Client(conString);

client.connect((err) => {
    if (err) {
        return console.error('Não foi possível conectar ao banco.', err);
    }
    client.query('SELECT NOW()', (err, result) => {
        if (err) {
            return console.error('Erro ao executar a query.', err);
        }
        console.log(result.rows[0]);
    });
});

app.get("/", (req, res) => {
    console.log("Response ok.");
    res.send("Ok – Servidor disponível.");
});

app.get("/usuarios", (req, res) => {
    try {
        client.query("SELECT * FROM Usuarios",// query = pesquisa
            (err, result) => {
                if (err) {
                    return console.error("Erro ao executar a qry de SELECT", err);
                }
                res.send(result.rows);
                console.log("Rota: get usuarios");
            });
    } catch (error) {
        console.log(error);
    }
});
// slide 22:

app.get("/usuarios/:id", (req, res) => { // 
    try {
        console.log("Rota: usuarios/" + req.params.id);
        client.query(
            "SELECT * FROM Usuarios WHERE id = $1", [req.params.id],
            (err, result) => {
                if (err) {
                    res.send("O dado: " + req.params.id + "informado, NÂO é valido1");
                    return console.error("Erro ao executar a qry de SELECT id", err);
                }
                if (result.rowCount == 0) {
                    res.send("NÃO há usuario para o codigo: " + req.params.id);
                } else {
                    res.send(result.rows);
                }
                res.send(result.rows);
                //console.log(result);
            }
        );
    } catch (error) {
        console.log(error);
    }
});

app.delete("/usuarios/:id", (req, res) => {
    try {
        console.log("Rota: delete/" + req.params.id);
        client.query(
            "DELETE FROM Usuarios WHERE id = $1", [req.params.id],
            (err, result) => {
                if (err) {
                    res.send("O dado: +" + req.params.id + "informado, NÃO é valido");
                    return console.error("Erro ao executar a qry de DELETE", err);
                } else {
                    if (result.rowCount == 0) {
                        res.status(404).json({ info: "Registro não encontrado." });
                    } else {
                        res.status(200).json({ info: `Registro excluído. Código: ${req.params.id}` });
                    }
                }
                console.log(result);
            }
        );
    } catch (error) {
        console.log(error);
    }
});
// metodo POST

app.post("/usuarios", (req, res) => {
    try {

        console.log("Alguém enviou um post com os dados:", req.body);
        const { nome, email, altura, peso } = req.body;
        
        client.query(
            "INSERT INTO Usuarios (nome, email, altura, peso) VALUES ($1, $2, $3, $4) RETURNING *", 
            [nome, email, altura, peso],
            (err, result) => {
                if (err) {
                    console.error("Erro ao executar a qry de INSERT", err);
                    return res.status(500).json({ error: "Erro ao inserir usuário" });
                }
                
                const { id } = result.rows[0];
                res.setHeader("id", `${id}`);
                res.status(201).json(result.rows[0]);
                console.log(result);
            }
        );
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ error: "Erro interno do servidor" });
    }
});
// metodo PUT
app.put("/usuarios/:id", (req, res) => {
try {
console.log("Alguém enviou um update com os dados:", req.body);
const id = req.params.id;
const { nome, email, altura, peso } = req.body;
client.query(
"UPDATE Usuarios SET nome=$1, email=$2, altura=$3, peso=$4 WHERE id =$5 ",
[nome, email, altura, peso, id],
(err, result) => {
if (err) {
return console.error("Erro ao executar a qry de UPDATE", err);
} else {
res.setHeader("id", id);
res.status(202).json({ "identificador": id });
console.log(result);
}
}
);
} catch (erro) {
console.error(erro);
}
});
// o metodo listen debe ser o ultimo da api
app.listen(config.port, () =>
    console.log("Servidor funcionando na porta " + config.port)
);
module.exports = app;