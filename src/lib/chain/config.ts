type Environment = Record<string, string | undefined>;

export function getBnbChainId(env: Environment = process.env) {
  const value = env.BNB_CHAIN_ID ?? "97";
  if (!/^\d+$/.test(value)) throw new Error("BNB_CHAIN_ID must be a positive integer");
  const chainId = Number(value);
  if (!Number.isSafeInteger(chainId) || chainId <= 0) throw new Error("BNB_CHAIN_ID must be a positive integer");
  return chainId;
}

export function getBnbNetwork(env: Environment = process.env) {
  const chainId = getBnbChainId(env);
  if (chainId === 97) return "bsc-testnet";
  if (chainId === 56) return "bsc-mainnet";
  throw new Error(`BNB_CHAIN_ID ${chainId} is not supported by the ERC-8183 SDK`);
}
