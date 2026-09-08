import "./globals.css";
import Link from "next/link";
import { WalletControl } from "@/components/wallet-control";
import { Web3Providers } from "@/components/web3-providers";

export const metadata = {
  title: "YieldGPT — Inspect financial agents on BNB Chain",
  description: "Discover, verify, and match financial agents to your constraints on BNB Chain.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body><Web3Providers><header className="site-header shell"><Link className="brand" href="/"><span className="brand-mark">YG</span><span>YieldGPT <span className="brand-chain">/ BNB Chain</span></span></Link><nav className="site-nav" aria-label="Primary navigation"><Link href="/">Discover</Link><Link href="/recommend">Match</Link><Link href="/dashboard">Activity</Link></nav><WalletControl /></header>{children}</Web3Providers></body>
    </html>
  );
}
