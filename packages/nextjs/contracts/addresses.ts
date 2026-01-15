// =============================================================================
// Contract Addresses - Accrue
// Deployed on Mantle Sepolia Testnet (Chain ID: 5003)
// =============================================================================

export const CONTRACTS = {
  // Mantle Sepolia Testnet (Chain ID: 5003)
  mantleSepolia: {
    mETH: "0xB7Ab966115aF7d21E7Aa6e31A9AdfC92291092E0" as `0x${string}`,
    rwaToken: "0xa520c7Aa947f3B610d274377D261Eb5AcD70883F" as `0x${string}`,
    yieldVault: "0x9C70C2F67028e5464F5b60E29648240e358E83B6" as `0x${string}`,
  },
} as const;

// Helper to get addresses for current chain
export function getContractAddresses(chainId: number) {
  // Only Mantle Sepolia Testnet supported
  return CONTRACTS.mantleSepolia;
}
