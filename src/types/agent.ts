export type AgentCategory =
  | "yield"
  | "lp_rebalancing"
  | "grid_trading"
  | "health_factor";

export type AgentService = {
  name: string;
  url: string;
};

export type Agent = {
  id: string;
  chainId: number;
  tokenId: string;
  name: string;
  description: string | null;
  ownerAddress: `0x${string}`;
  agentWallet: `0x${string}` | null;
  category: AgentCategory;
  services: AgentService[];
  skills: string[];
  protocols: string[];
  activeClaimed: boolean | null;
  x402Support: boolean;
  createdAt: string;
  indexedAt: string;
};

export type AgentObservation = {
  agentId: string;
  endpointReachable: boolean;
  endpointLatencyMs: number | null;
  lastSuccessfulProbe: string | null;
  recentTxCount: number;
  recentJobCount: number;
  successfulJobCount: number;
  failedJobCount: number;
  observedProtocols: string[];
  observedAssets: string[];
  lastOnchainActivity: string | null;
  calculatedAt: string;
};

