import { pgTable, text, integer, timestamp, jsonb, numeric, boolean } from "drizzle-orm/pg-core";

export const agents = pgTable("agents", {
  id: text("id").primaryKey(),
  chainId: integer("chain_id").notNull(),
  tokenId: text("token_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  ownerAddress: text("owner_address").notNull(),
  agentWallet: text("agent_wallet"),
  category: text("category").notNull(),
  skills: jsonb("skills").$type<string[]>().notNull().default([]),
  protocols: jsonb("protocols").$type<string[]>().notNull().default([]),
  activeClaimed: boolean("active_claimed"),
  x402Support: boolean("x402_support").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  indexedAt: timestamp("indexed_at", { withTimezone: true }).notNull().defaultNow(),
});

export const agentObservations = pgTable("agent_observations", {
  id: text("id").primaryKey(),
  agentId: text("agent_id").notNull(),
  endpointReachable: boolean("endpoint_reachable").notNull(),
  endpointLatencyMs: integer("endpoint_latency_ms"),
  recentTxCount: integer("recent_tx_count").notNull().default(0),
  successfulJobCount: integer("successful_job_count").notNull().default(0),
  failedJobCount: integer("failed_job_count").notNull().default(0),
  observedProtocols: jsonb("observed_protocols").$type<string[]>().notNull().default([]),
  calculatedAt: timestamp("calculated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const agentServices = pgTable("agent_services", {
  id: text("id").primaryKey(),
  agentId: text("agent_id").notNull(),
  name: text("name").notNull(),
  url: text("url").notNull(),
});

export const recommendations = pgTable("recommendations", {
  id: text("id").primaryKey(),
  intent: jsonb("intent").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const recommendationScores = pgTable("recommendation_scores", {
  id: text("id").primaryKey(),
  recommendationId: text("recommendation_id").notNull(),
  agentId: text("agent_id").notNull(),
  totalScore: integer("total_score").notNull(),
  components: jsonb("components").notNull(),
  explanations: jsonb("explanations").notNull(),
});

export const jobs = pgTable("jobs", {
  id: text("id").primaryKey(),
  userAddress: text("user_address").notNull(),
  agentId: text("agent_id").notNull(),
  erc8183JobId: text("erc8183_job_id"),
  status: text("status").notNull(),
  budget: numeric("budget").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const jobTransactions = pgTable("job_transactions", {
  id: text("id").primaryKey(),
  jobId: text("job_id").notNull(),
  kind: text("kind").notNull(),
  txHash: text("tx_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const permissions = pgTable("permissions", {
  id: text("id").primaryKey(),
  userAddress: text("user_address").notNull(),
  agentAddress: text("agent_address").notNull(),
  sessionId: text("session_id").notNull(),
  allowedContracts: jsonb("allowed_contracts").$type<string[]>().notNull(),
  allowedFunctions: jsonb("allowed_functions").$type<string[]>().notNull(),
  perTransactionCap: numeric("per_transaction_cap").notNull(),
  totalSpendCap: numeric("total_spend_cap").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  status: text("status").notNull(),
});
