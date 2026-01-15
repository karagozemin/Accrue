"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig, http } from "wagmi";
import { mantleSepoliaTestnet } from "wagmi/chains";
import { RainbowKitProvider, getDefaultConfig, darkTheme } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";

// Configure chains - Mantle Sepolia Testnet only
const config = getDefaultConfig({
  appName: "Accrue",
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "YOUR_PROJECT_ID",
  chains: [mantleSepoliaTestnet],
  transports: {
    [mantleSepoliaTestnet.id]: http("https://rpc.sepolia.mantle.xyz"),
  },
  ssr: true,
});

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: "#14b89a",
            accentColorForeground: "white",
            borderRadius: "large",
            fontStack: "system",
          })}
        >
          {mounted ? children : null}
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 5000,
              style: {
                background: "#1a1a2e",
                color: "#fff",
                border: "1px solid #2d2d44",
                borderRadius: "12px",
              },
              success: {
                iconTheme: {
                  primary: "#14b89a",
                  secondary: "#fff",
                },
              },
              error: {
                iconTheme: {
                  primary: "#ef4444",
                  secondary: "#fff",
                },
              },
            }}
          />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
