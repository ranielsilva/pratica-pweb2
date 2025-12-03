import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bd from "./src/models/index.js";
import redis from "./redis.js"; // <-- usar seu arquivo redis.js

// Carrega as variáveis de ambiente
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

const { Task, sequelize } = bd;

// Conexão com o banco de dados
try {
  await sequelize.authenticate();
  console.log("Conexão com o banco de dados bem-sucedida.");
  await sequelize.sync();
  console.log("Modelos sincronizados com o banco de dados.");
} catch (error) {
  console.error("Não foi possível conectar ao banco de dados:", error);
}

app.get("/", (req, res) => {
  res.json({ message: "Hello World" });
});

// ------------------------------------------------------
// ROTAS DE TAREFAS COM CACHE REDIS
// ------------------------------------------------------

// GET /tasks (COM CACHE)
app.get("/tasks", async (req, res) => {
  const cacheKey = "tasks:all";

  try {
    // 1) Busca no Redis
    const cached = await redis.get(cacheKey);

    if (cached) {
      console.log("CACHE HIT →", cacheKey);
      return res.json(JSON.parse(cached));
    }

    console.log("CACHE MISS →", cacheKey);

    // 2) Busca no banco via Sequelize
    const tasks = await Task.findAll({
      order: [["createdAt", "DESC"]],
    });

    // 3) Armazena no cache (15s)
    await redis.set(cacheKey, JSON.stringify(tasks), "EX", 15);

    return res.json(tasks);

  } catch (error) {
    console.error("Erro GET /tasks:", error);
    return res.status(500).json({ error: "Erro interno" });
  }
});

// POST /tasks (INVALIDA CACHE)
app.post("/tasks", async (req, res) => {
  const { description } = req.body;

  if (!description)
    return res.status(400).json({ error: "Descrição obrigatória" });

  try {
    const task = await Task.create({
      description,
      completed: false,
    });

    await redis.del("tasks:all");
    console.log("Cache invalidado (CREATE)");

    return res.status(201).json(task);
  } catch (error) {
    console.error("Erro POST /tasks:", error);
    return res.status(500).json({ error: "Erro interno" });
  }
});

// GET /tasks/:id
app.get("/tasks/:id", async (req, res) => {
  const task = await Task.findByPk(req.params.id);
  if (!task) return res.status(404).json({ error: "Tarefa não encontrada" });
  res.json(task);
});

// PUT /tasks/:id (INVALIDA CACHE)
app.put("/tasks/:id", async (req, res) => {
  const { description, completed } = req.body;

  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ error: "Tarefa não encontrada" });

    await task.update({ description, completed });

    await redis.del('tasks:all');
    console.log("Cache invalidado (UPDATE)");

    return res.json(task);
  } catch (error) {
    console.error("Erro PUT /tasks/:id:", error);
    return res.status(500).json({ error: "Erro interno" });
  }
});

// DELETE /tasks/:id (INVALIDA CACHE)
app.delete("/tasks/:id", async (req, res) => {
  try {
    const deleted = await Task.destroy({
      where: { id: req.params.id },
    });

    if (!deleted)
      return res.status(404).json({ error: "Tarefa não encontrada" });

    await redis.del("tasks:all");
    console.log("Cache invalidado (DELETE)");

    return res.status(204).send();
  } catch (error) {
    console.error("Erro DELETE /tasks/:id:", error);
    return res.status(500).json({ error: "Erro interno" });
  }
});


app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on port ${port}`);
});