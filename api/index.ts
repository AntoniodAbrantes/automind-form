import express from "express";
import { registerRoutes } from "../server/routes";
import { serveStatic } from "../server/vite";

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

// Configura as rotas da API
(async () => {
  try {
    await registerRoutes(app);
    
    // Middleware de tratamento de erros
    app.use((err: any, _req: any, res: any, _next: any) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      
      console.error(`Error: ${err.message}`);
      res.status(status).json({ message });
    });
    
    // Serve arquivos estáticos em produção
    serveStatic(app);
    
  } catch (error) {
    console.error("Failed to setup server:", error);
  }
})();

// Exporta o app para Vercel
export default app; 