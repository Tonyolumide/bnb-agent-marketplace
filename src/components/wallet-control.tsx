"use client";

import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { bscTestnet } from "wagmi/chains";

export function WalletControl() {
  const { address, chainId, isConnected } = useAccount();
  const { connectors, connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitching } = useSwitchChain();

  if (!isConnected) {
    return <button className="wallet-button" disabled={isPending || !connectors[0]} onClick={() => connectors[0] && connect({ connector: connectors[0] })}>{isPending ? "Connecting…" : "Connect wallet"}</button>;
  }
  if (chainId !== bscTestnet.id) {
    return <button className="wallet-button warning-button" disabled={isSwitching} onClick={() => switchChain({ chainId: bscTestnet.id })}>{isSwitching ? "Switching…" : "Switch to BSC testnet"}</button>;
  }
  return <button className="wallet-button connected" onClick={() => disconnect()} aria-label={`Disconnect ${address}`}>{address?.slice(0, 6)}…{address?.slice(-4)}</button>;
}
