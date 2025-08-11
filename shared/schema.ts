import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const leads = pgTable("leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  // Company Information
  companyName: text("company_name").notNull(),
  industry: text("industry").notNull(),
  companySize: text("company_size").notNull(),
  position: text("position").notNull(),
  
  // Challenges
  challenges: jsonb("challenges").$type<string[]>().default([]),
  mainChallenge: text("main_challenge"),
  impactLevel: text("impact_level"),
  
  // Solutions Interest
  interestedSolutions: jsonb("interested_solutions").$type<string[]>().default([]),
  motivation: text("motivation"),
  
  // Contact Information
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  preferredTime: text("preferred_time"),
  budget: text("budget"),
  urgency: text("urgency"),
  comments: text("comments"),
  
  createdAt: timestamp("created_at").defaultNow()
});

export const insertLeadSchema = createInsertSchema(leads, {
  email: z.string().email("Email inválido"),
  phone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
  companyName: z.string().min(2, "Nome da empresa é obrigatório"),
  industry: z.string().min(1, "Setor é obrigatório"),
  companySize: z.string().min(1, "Porte da empresa é obrigatório"),
  position: z.string().min(2, "Cargo é obrigatório"),
  fullName: z.string().min(2, "Nome completo é obrigatório"),
  challenges: z.array(z.string()).min(1, "Selecione pelo menos um desafio"),
  interestedSolutions: z.array(z.string()).optional()
}).omit({
  id: true,
  createdAt: true
});

export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leads.$inferSelect;
