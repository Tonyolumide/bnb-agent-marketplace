import "./globals.css";
import Link from "next/link";
import { WalletControl } from "@/components/wallet-control";
import { Web3Providers } from "@/components/web3-providers";

export const metadata = {
  title: "BNB Financial Agent Marketplace",
  description: "Discover, evaluate, and safely hire financial agents on BNB Chain.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body><Web3Providers><header className="site-header"><Link href="/">Agent Market</Link><WalletControl /></header>{children}</Web3Providers></body>
    </html>
  );
}
