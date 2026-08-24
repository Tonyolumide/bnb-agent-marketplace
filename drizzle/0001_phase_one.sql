CREATE TABLE IF NOT EXISTS agents (
  id text PRIMARY KEY,
  chain_id integer NOT NULL,
  token_id text NOT NULL,
  name text NOT NULL,
  description text,
  owner_address text NOT NULL,
  agent_wallet text,
  category text NOT NULL,
  skills jsonb NOT NULL DEFAULT '[]'::jsonb,
  protocols jsonb NOT NULL DEFAULT '[]'::jsonb,
  active_claimed boolean,
  x402_support boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL,
  indexed_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE agents ADD COLUMN IF NOT EXISTS skills jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS x402_support boolean NOT NULL DEFAULT false;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

CREATE TABLE IF NOT EXISTS agent_services (
  id text PRIMARY KEY,
  agent_id text NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  name text NOT NULL,
  url text NOT NULL
);

CREATE TABLE IF NOT EXISTS agent_observations (
  id text PRIMARY KEY,
  agent_id text NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  endpoint_reachable boolean NOT NULL,
  endpoint_latency_ms integer,
  recent_tx_count integer NOT NULL DEFAULT 0,
  successful_job_count integer NOT NULL DEFAULT 0,
  failed_job_count integer NOT NULL DEFAULT 0,
  observed_protocols jsonb NOT NULL DEFAULT '[]'::jsonb,
  calculated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS agents_chain_category_idx ON agents(chain_id, category);
CREATE INDEX IF NOT EXISTS agent_services_agent_idx ON agent_services(agent_id);
CREATE INDEX IF NOT EXISTS agent_observations_agent_idx ON agent_observations(agent_id, calculated_at DESC);
