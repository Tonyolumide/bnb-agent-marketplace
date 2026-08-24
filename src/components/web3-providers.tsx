"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { WagmiProvider, createConfig, http } from "wagmi";
import { bscTestnet } from "wagmi/chains";
import { injected } from "wagmi/connectors";

const config = createConfig({
  chains: [bscTestnet],
  connectors: [injected()],
  transports: { [bscTestnet.id]: http() },
  ssr: true,
});

export function Web3Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return <WagmiProvider config={config}><QueryClientProvider client={queryClient}>{children}</QueryClientProvider></WagmiProvider>;
}
