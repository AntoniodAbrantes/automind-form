import express from "express";
import { z } from "zod";
import path from "path";
import fs from "fs";

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

// Schema de validação para leads
const insertLeadSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  company: z.string().optional(),
  role: z.string().optional(),
  challenges: z.array(z.string()).default([]),
  mainChallenge: z.string().optional(),
  impactLevel: z.string().optional(),
  interestedSolutions: z.array(z.string()).default([]),
  motivation: z.string().optional(),
  preferredTime: z.string().optional(),
  budget: z.string().optional(),
  urgency: z.string().optional(),
  comments: z.string().optional()
});

// Storage em memória simples
class SimpleStorage {
  private leads = new Map();
  private idCounter = 1;

  async createLead(data: any) {
    const id = `lead_${this.idCounter++}`;
    const lead = {
      id,
      ...data,
      createdAt: new Date().toISOString()
    };
    this.leads.set(id, lead);
    return lead;
  }

  async getAllLeads() {
    return Array.from(this.leads.values());
  }

  async getLead(id: string) {
    return this.leads.get(id) || null;
  }
}

const storage = new SimpleStorage();

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

// Servir arquivos estáticos do frontend
const distPath = path.resolve(process.cwd(), "dist", "public");

if (fs.existsSync(distPath)) {
  // Serve arquivos estáticos (CSS, JS, imagens)
  app.use(express.static(distPath));

  // Fallback para SPA - sempre retorna index.html para rotas não-API
  app.get("*", (req, res) => {
    // Se não for uma rota da API, serve o index.html
    if (!req.path.startsWith("/api")) {
      res.sendFile(path.join(distPath, "index.html"));
    } else {
      res.status(404).json({ message: "API endpoint não encontrado" });
    }
  });
} else {
  // Fallback se o diretório dist não existir
  app.use("*", (req, res) => {
    if (req.path.startsWith("/api")) {
      res.status(404).json({ message: "API endpoint não encontrado" });
    } else {
      res.status(200).json({
        message: "API Automind Form funcionando",
        status: "success",
        timestamp: new Date().toISOString(),
        note: "Frontend não encontrado. Execute 'npm run build' primeiro.",
        endpoints: [
          "POST /api/leads - Criar novo lead",
          "GET /api/leads - Listar todos os leads",
          "GET /api/leads/:id - Buscar lead específico"
        ]
      });
    }
  });
}

// Exporta o app para Vercel
export default app; 