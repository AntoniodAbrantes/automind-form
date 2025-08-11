import { drizzle } from "drizzle-orm/neon-serverless";
import { migrate } from "drizzle-orm/neon-serverless/migrator";
import dotenv from "dotenv";

// Carrega variáveis de ambiente
dotenv.config();

async function runMigration() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error("❌ DATABASE_URL não encontrada nas variáveis de ambiente");
    console.log("👉 Configure a DATABASE_URL do seu projeto Supabase primeiro");
    process.exit(1);
  }

  console.log("🚀 Conectando ao Supabase...");
  
  try {
    const db = drizzle(databaseUrl);
    
    console.log("📦 Executando migrações...");
    await migrate(db, { migrationsFolder: "./drizzle" });
    
    console.log("✅ Migrações executadas com sucesso!");
    console.log("🎉 Banco de dados está pronto para uso!");
    
  } catch (error) {
    console.error("❌ Erro durante a migração:", error);
    process.exit(1);
  }
}

runMigration();