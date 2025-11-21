import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import fs from "fs";
import path from "path";

const app = express();
app.use(cors());
app.use(express.json());

const historyPath = path.join(process.cwd(), "data", "history.json");
fs.mkdirSync(path.dirname(historyPath), { recursive: true });
let history = [];
if (fs.existsSync(historyPath)) {
  history = JSON.parse(fs.readFileSync(historyPath, "utf8"));
}

app.post("/api/check-anemia", async (req, res) => {
  try {
    const response = await fetch("http://127.0.0.1:5000/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    const record = { id: Date.now(), ...req.body, result: data.message, anemia: data.anemia, probability: data.probability, timestamp: new Date().toISOString() };
    history.push(record);
    fs.writeFileSync(historyPath, JSON.stringify(history, null, 2));
    res.json(record);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/history", (req, res) => res.json(history));

app.delete("/api/history/:id", (req, res) => {
  const { id } = req.params;
  history = history.filter((it) => it.id !== parseInt(id));
  fs.writeFileSync(historyPath, JSON.stringify(history, null, 2));
  res.json({ message: "Deleted" });
});

app.listen(8000, () => console.log("Node server running on port 8000"));
