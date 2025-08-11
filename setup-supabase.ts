import { drizzle } from "drizzle-orm/neon-serverless";
import { leads } from "./shared/schema";
import dotenv from "dotenv";
import ws from "ws";

// Carrega variáveis de ambiente
dotenv.config();

async function setupSupabase() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error("❌ DATABASE_URL não encontrada!");
    console.log("\n📝 Para configurar:");
    console.log("1. Acesse: https://supabase.com/dashboard/projects");
    console.log("2. Crie um projeto (se não tem um)");
    console.log("3. Clique em 'Connect' → copie a URI do 'Transaction pooler'");
    console.log("4. Substitua [YOUR-PASSWORD] pela sua senha");
    console.log("5. Adicione a DATABASE_URL no painel de segredos do Replit\n");
    process.exit(1);
  }

  console.log("🚀 Conectando ao Supabase...");
  
  try {
    const db = drizzle(databaseUrl, {
      connection: {
        webSocketConstructor: ws
      }
    });
    
    // Testa a conexão fazendo uma query simples
    console.log("🔍 Testando conexão...");
    const result = await db.select().from(leads).limit(1);
    
    console.log("✅ Conexão com Supabase estabelecida!");
    console.log("🎉 O banco está funcionando perfeitamente!");
    console.log(`📊 Schema configurado para tabela 'leads'`);
    
  } catch (error: any) {
    console.error("❌ Erro ao conectar:", error.message);
    
    if (error.message.includes("relation") && error.message.includes("does not exist")) {
      console.log("\n🔧 A tabela 'leads' ainda não existe.");
      console.log("Execute: npm run setup-db");
    }
    
    process.exit(1);
  }
}

setupSupabase();