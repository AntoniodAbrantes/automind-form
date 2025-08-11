import { type Lead, type InsertLead, leads } from "@shared/schema";
import { randomUUID } from "crypto";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq, desc } from "drizzle-orm";
import postgres from "postgres";

export interface IStorage {
  createLead(lead: InsertLead): Promise<Lead>;
  getLead(id: string): Promise<Lead | undefined>;
  getAllLeads(): Promise<Lead[]>;
}

export class MemStorage implements IStorage {
  private leads: Map<string, Lead>;

  constructor() {
    this.leads = new Map();
  }

  async createLead(insertLead: InsertLead): Promise<Lead> {
    const id = randomUUID();
    const lead: Lead = { 
      ...insertLead, 
      id,
      createdAt: new Date(),
      mainChallenge: insertLead.mainChallenge || null,
      impactLevel: insertLead.impactLevel || null,
      interestedSolutions: insertLead.interestedSolutions || null,
      motivation: insertLead.motivation || null,
      preferredTime: insertLead.preferredTime || null,
      budget: insertLead.budget || null,
      urgency: insertLead.urgency || null,
      comments: insertLead.comments || null
    };
    this.leads.set(id, lead);
    return lead;
  }

  async getLead(id: string): Promise<Lead | undefined> {
    return this.leads.get(id);
  }

  async getAllLeads(): Promise<Lead[]> {
    return Array.from(this.leads.values()).sort((a, b) => 
      (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
    );
  }
}

export class DatabaseStorage implements IStorage {
  private db;

  constructor() {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error("DATABASE_URL não encontrada nas variáveis de ambiente");
    }
    // Configuração para Supabase com postgres-js
    const client = postgres(databaseUrl);
    this.db = drizzle(client);
  }

  async createLead(insertLead: InsertLead): Promise<Lead> {
    const [lead] = await this.db.insert(leads).values(insertLead).returning();
    return lead;
  }

  async getLead(id: string): Promise<Lead | undefined> {
    const [lead] = await this.db.select().from(leads).where(eq(leads.id, id)).limit(1);
    return lead;
  }

  async getAllLeads(): Promise<Lead[]> {
    return await this.db.select().from(leads).orderBy(desc(leads.createdAt));
  }
}

// Use DatabaseStorage se DATABASE_URL estiver disponível, senão usa MemStorage
export const storage = process.env.DATABASE_URL 
  ? new DatabaseStorage() 
  : new MemStorage();
