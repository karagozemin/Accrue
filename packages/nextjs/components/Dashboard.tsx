"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useAccount, useBalance } from "wagmi";
import toast from "react-hot-toast";
import { YieldProgress } from "./YieldProgress";
import { Portfolio } from "./Portfolio";
import { RWAMarketplace } from "./RWAMarketplace";
import { useYieldVault, useMETH } from "../hooks";

// Asset names mapping
const ASSET_NAMES: Record<number, string> = {
  1: "NYC Real Estate",
  2: "Treasury Bonds",
  3: "Invoice Financing",
  4: "Infrastructure",
};

export function Dashboard() {
  const { address } = useAccount();
  const { data: mntBalance } = useBalance({ address });
  const [depositAmount, setDepositAmount] = useState("");
  const [activeTab, setActiveTab] = useState<"deposit" | "portfolio" | "marketplace">("deposit");

  // Use custom hooks for contract interactions
  const {
    dashboard,
    yieldProgress,
    protocolStats,
    isLoading,
    isWritePending,
    isConfirming,
    isConfirmed,
    writeError,
    deposit,
    harvestAndBuy,
    setTargetAsset,
    mockYield,
    refetch,
  } = useYieldVault();

  const { 
    balance: mETHBalance, 
    approveMax, 
    faucet,
    canUseFaucet,
    cooldownRemaining,
    isPending: isApproving,
    isConfirming: isFaucetConfirming,
    isConfirmed: isFaucetConfirmed,
    refetch: refetchMETH,
  } = useMETH();

  // Track last action for toast messages
  const [lastAction, setLastAction] = useState<string | null>(null);

  // Show toast on transaction confirmation
  useEffect(() => {
    if (isConfirmed && lastAction) {
      toast.success(`${lastAction} successful! 🎉`);
      setLastAction(null);
      refetch();
      refetchMETH();
    }
  }, [isConfirmed, lastAction]);

  useEffect(() => {
    if (isFaucetConfirmed && lastAction === "Faucet") {
      toast.success("Got 10 test mETH! 🚰");
      setLastAction(null);
      refetchMETH();
    }
  }, [isFaucetConfirmed, lastAction]);

  // Show error toast
  useEffect(() => {
    if (writeError) {
      toast.error(`Transaction failed: ${writeError.message.slice(0, 50)}...`);
      setLastAction(null);
    }
  }, [writeError]);

  // Fallback data for when contracts aren't deployed
  const displayData = dashboard || {
    principal: "0",
    pendingYield: "0",
    totalHarvested: "0",
    rwaValue: "0",
    targetAssetId: 1,
  };

  const displayProgress = yieldProgress || {
    progressPercent: 0,
  };

  const displayStats = protocolStats || {
    totalDeposits: "0",
    totalUsers: 0,
    protocolYield: "0",
    rwaValue: "0",
  };

  // Handlers
  const handleDeposit = async () => {
    if (!depositAmount) return;
    try {
      setLastAction("Deposit");
      toast.loading("Approving mETH...", { id: "deposit" });
      await approveMax();
      toast.loading("Depositing mETH...", { id: "deposit" });
      await deposit(depositAmount);
      setDepositAmount("");
      toast.dismiss("deposit");
    } catch (error) {
      toast.dismiss("deposit");
      toast.error("Deposit failed");
      console.error("Deposit failed:", error);
    }
  };

  const handleHarvest = async () => {
    try {
      setLastAction("Harvest & Buy RWA");
      toast.loading("Harvesting yield...", { id: "harvest" });
      await harvestAndBuy();
      toast.dismiss("harvest");
    } catch (error) {
      toast.dismiss("harvest");
      toast.error("Harvest failed");
      console.error("Harvest failed:", error);
    }
  };

  const handleFaucet = async () => {
    try {
      setLastAction("Faucet");
      toast.loading("Getting test mETH...", { id: "faucet" });
      await faucet("10");
      toast.dismiss("faucet");
    } catch (error) {
      toast.dismiss("faucet");
      toast.error("Faucet failed");
      console.error("Faucet failed:", error);
    }
  };

  const handleSetTargetAsset = async (assetId: number) => {
    try {
      setLastAction(`Target changed to ${ASSET_NAMES[assetId]}`);
      toast.loading("Changing target asset...", { id: "target" });
      await setTargetAsset(assetId);
      toast.dismiss("target");
    } catch (error) {
      toast.dismiss("target");
      toast.error("Failed to change target");
      console.error("Set target failed:", error);
    }
  };

  const handleMockYield = async () => {
    try {
      setLastAction("Yield simulated");
      toast.loading("Simulating yield...", { id: "mock" });
      await mockYield("0.01");
      toast.dismiss("mock");
    } catch (error) {
      toast.dismiss("mock");
      toast.error("Mock yield failed");
      console.error("Mock yield failed:", error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, <span className="text-gradient">{address?.slice(0, 8)}...</span>
        </h1>
        <p className="text-gray-400">Your yield is working hard to build real wealth</p>
        {mETHBalance && parseFloat(mETHBalance) > 0 && (
          <p className="text-sm text-mantle-400 mt-1">Balance: {parseFloat(mETHBalance).toFixed(4)} mETH</p>
        )}
      </motion.div>

      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
      >
        <div className="stat-card">
          <span className="stat-label">Principal Staked</span>
          <span className="stat-value text-white">{parseFloat(displayData.principal).toFixed(4)} mETH</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Pending Yield</span>
          <span className="stat-value text-mantle-400">{parseFloat(displayData.pendingYield).toFixed(6)} mETH</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total Harvested</span>
          <span className="stat-value text-brick-400">{parseFloat(displayData.totalHarvested).toFixed(4)} mETH</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">RWA Value</span>
          <span className="stat-value text-gradient">{parseFloat(displayData.rwaValue).toFixed(4)} mETH</span>
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Actions */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Tab Navigation */}
          <div className="flex gap-2 p-1 bg-dark-800 rounded-xl">
            <button
              onClick={() => setActiveTab("deposit")}
              className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                activeTab === "deposit"
                  ? "bg-dark-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Deposit & Harvest
            </button>
            <button
              onClick={() => setActiveTab("portfolio")}
              className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                activeTab === "portfolio"
                  ? "bg-dark-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              RWA Portfolio
            </button>
            <button
              onClick={() => setActiveTab("marketplace")}
              className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                activeTab === "marketplace"
                  ? "bg-dark-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Marketplace
            </button>
          </div>

          {activeTab === "deposit" ? (
            <div className="space-y-6">
              {/* Wallet Balances */}
              <div className="card bg-dark-800/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div>
                      <span className="text-xs text-gray-500 block">MNT Balance</span>
                      <span className="font-mono text-lg text-white">
                        {mntBalance ? parseFloat(mntBalance.formatted).toFixed(4) : "0.0000"} MNT
                      </span>
                    </div>
                    <div className="w-px h-8 bg-dark-600"></div>
                    <div>
                      <span className="text-xs text-gray-500 block">mETH Balance</span>
                      <span className="font-mono text-lg text-mantle-400">
                        {mETHBalance ? parseFloat(mETHBalance).toFixed(4) : "0.0000"} mETH
                      </span>
                    </div>
                  </div>
                  <span className="text-2xl">💰</span>
                </div>
              </div>

              {/* Deposit Card */}
              <div className="card">
                <h3 className="text-lg font-bold mb-4">Deposit mETH</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Amount</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        placeholder="0.0"
                        className="input-field pr-20"
                      />
                      <button
                        className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-sm text-mantle-400 hover:bg-dark-600 rounded-lg transition-colors"
                        onClick={() => setDepositAmount(mETHBalance || "10")}
                      >
                        MAX
                      </button>
                    </div>
                  </div>
                  <button 
                    className="btn-primary w-full disabled:opacity-50"
                    onClick={handleDeposit}
                    disabled={isWritePending || isConfirming || isApproving || !depositAmount}
                  >
                    {isApproving ? "Approving..." : isWritePending ? "Depositing..." : isConfirming ? "Confirming..." : "Deposit mETH"}
                  </button>
                </div>
              </div>

              {/* Yield Progress */}
              <YieldProgress
                currentYield={displayData.pendingYield}
                targetAsset={ASSET_NAMES[displayData.targetAssetId] || "NYC Real Estate"}
                progressPercent={displayProgress.progressPercent}
              />

              {/* Harvest Card */}
              <div className="card bg-gradient-to-br from-mantle-500/10 to-brick-500/10">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold">Ready to Harvest</h3>
                    <p className="text-gray-400 text-sm">
                      Convert {parseFloat(displayData.pendingYield).toFixed(6)} mETH yield to RWA
                    </p>
                    {parseFloat(displayData.pendingYield) > 0 && parseFloat(displayData.pendingYield) < 0.001 && (
                      <p className="text-yellow-400 text-xs mt-1">
                        ⚠️ Minimum 0.001 mETH required to harvest
                      </p>
                    )}
                  </div>
                  <span className="text-4xl">🌾</span>
                </div>
                <div className="space-y-2">
                  <button 
                    className="btn-primary w-full disabled:opacity-50"
                    onClick={handleHarvest}
                    disabled={isWritePending || isConfirming || parseFloat(displayData.pendingYield) < 0.001}
                  >
                    {isWritePending || isConfirming ? "Processing..." : "Harvest & Buy RWA"}
                  </button>
                  {parseFloat(displayData.principal) > 0 && (
                    <button 
                      className="btn-secondary w-full text-sm"
                      onClick={handleMockYield}
                      disabled={isWritePending || isConfirming}
                    >
                      🧪 Simulate 0.01 mETH Yield (Testnet)
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : activeTab === "portfolio" ? (
            <Portfolio />
          ) : (
            <RWAMarketplace />
          )}
        </motion.div>

        {/* Right Column - Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          {/* Target Asset Selection */}
          <div className="card">
            <h3 className="text-lg font-bold mb-4">Target Asset</h3>
            <p className="text-gray-400 text-sm mb-4">
              Select which RWA your yield purchases
            </p>
            {parseFloat(displayData.principal) === 0 && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-4">
                <p className="text-yellow-400 text-sm">
                  ⚠️ Deposit mETH first to change target asset
                </p>
              </div>
            )}
            <div className="space-y-2">
              {[
                { id: 1, name: "NYC Real Estate", apy: "4.5%" },
                { id: 2, name: "Treasury Bonds", apy: "5.25%" },
                { id: 3, name: "Invoice Financing", apy: "8.5%" },
                { id: 4, name: "Infrastructure", apy: "6.5%" },
              ].map((asset) => (
                <button
                  key={asset.id}
                  onClick={() => handleSetTargetAsset(asset.id)}
                  disabled={isWritePending || isConfirming || parseFloat(displayData.principal) === 0}
                  className={`w-full p-3 rounded-xl flex items-center justify-between transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    asset.id === displayData.targetAssetId
                      ? "bg-mantle-500/20 border border-mantle-500/50"
                      : "bg-dark-700 border border-dark-600 hover:border-mantle-500/50 hover:bg-dark-600"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {asset.id === displayData.targetAssetId && <span className="text-mantle-400">✓</span>}
                    <span>{asset.name}</span>
                  </div>
                  <span className="text-mantle-400">{asset.apy}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Protocol Stats */}
          <div className="card">
            <h3 className="text-lg font-bold mb-4">Protocol Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Value Locked</span>
                <span className="font-mono">{parseFloat(displayStats.totalDeposits).toFixed(2)} mETH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Users</span>
                <span className="font-mono">{displayStats.totalUsers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Yield Harvested</span>
                <span className="font-mono text-mantle-400">{parseFloat(displayStats.protocolYield).toFixed(4)} mETH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">RWA Purchased</span>
                <span className="font-mono text-brick-400">{parseFloat(displayStats.rwaValue).toFixed(4)} mETH</span>
              </div>
            </div>
          </div>

          {/* Get Test mETH */}
          <div className="card border-dashed border-mantle-500/30 bg-mantle-500/5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-mantle-400">🚰</span>
              <h3 className="font-bold text-mantle-400">Test Token Faucet</h3>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Get free test mETH tokens to try the protocol
            </p>
            {!canUseFaucet && cooldownRemaining > 0 && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-4">
                <p className="text-yellow-400 text-sm">
                  ⏳ Cooldown: {Math.floor(cooldownRemaining / 60)}m {cooldownRemaining % 60}s remaining
                </p>
              </div>
            )}
            <button 
              className="btn-primary w-full disabled:opacity-50"
              onClick={handleFaucet}
              disabled={isApproving || isFaucetConfirming || !canUseFaucet}
            >
              {isApproving || isFaucetConfirming ? "Processing..." : !canUseFaucet ? "⏳ Cooldown Active" : "🚰 Get 10 Test mETH"}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
