import express from "express";
import { storage } from "../server/storage";
import { insertLeadSchema } from "../shared/schema";

const app = express();

// Middleware para parsing JSON
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Middleware de logging
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      console.log(`${req.method} ${path} ${res.statusCode} in ${duration}ms`);
    }
  });
  
  next();
});

// Rota para criar um novo lead
app.post("/api/leads", async (req, res) => {
  try {
    const validatedData = insertLeadSchema.parse(req.body);
    const lead = await storage.createLead(validatedData);
    res.json(lead);
  } catch (error: any) {
    res.status(400).json({ 
      message: error.message || "Erro ao criar lead",
      errors: error.errors || []
    });
  }
});

// Rota para buscar todos os leads
app.get("/api/leads", async (req, res) => {
  try {
    const leads = await storage.getAllLeads();
    res.json(leads);
  } catch (error: any) {
    res.status(500).json({ message: "Erro ao buscar leads" });
  }
});

// Rota para buscar um lead específico
app.get("/api/leads/:id", async (req, res) => {
  try {
    const lead = await storage.getLead(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: "Lead não encontrado" });
    }
    res.json(lead);
  } catch (error: any) {
    res.status(500).json({ message: "Erro ao buscar lead" });
  }
});

// Middleware de tratamento de erros
app.use((err: any, _req: any, res: any, _next: any) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  
  console.error(`Error: ${err.message}`);
  res.status(status).json({ message });
});

// Rota para servir arquivos estáticos (fallback)
app.use("*", (_req, res) => {
  res.status(200).json({ 
    message: "API Automind Form funcionando", 
    status: "success",
    timestamp: new Date().toISOString(),
    endpoints: [
      "POST /api/leads - Criar novo lead",
      "GET /api/leads - Listar todos os leads",
      "GET /api/leads/:id - Buscar lead específico"
    ]
  });
});

// Exporta o app para Vercel
export default app; 