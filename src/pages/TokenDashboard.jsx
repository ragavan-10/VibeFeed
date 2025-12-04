import { useState, useEffect } from 'react';
import { useWallet } from '../hooks/WalletContext';
import { useSelector, useDispatch } from 'react-redux';
import { Coins, Lock, Unlock, Gift, ArrowRightLeft, TrendingUp, Clock, AlertCircle, Loader2, Check } from 'lucide-react';
import { setTokenData } from '../store/tokenSlice';
import { formatTokenAmount, formatDuration, formatNumber } from '../utils/format';
import StatCard from '../components/StatCard';
// import { DEMO_MODE } from '../utils/mockData';

const MIN_STAKE = 1000;

const TokenDashboard = () => {
  const dispatch = useDispatch();
  const { balance, stakedAmount, pendingRewards, unlockTime, votingPower, isStakedEnough } = useSelector(
    (state) => state.token
  );
  const { address } = useSelector((state) => state.user);
  const { contract, signerContract } = useWallet();

  const [isOwner, setIsOwner] = useState(false);

  const [activeTab, setActiveTab] = useState('stake');
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [isStaking, setIsStaking] = useState(false);
  const [isUnstaking, setIsUnstaking] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(0);

  // Update time remaining countdown
  useEffect(() => {
    const now = Math.floor(Date.now() / 1000);
    const remaining = Math.max(0, unlockTime - now);
    setTimeRemaining(remaining);

    const interval = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      setTimeRemaining(Math.max(0, unlockTime - now));
    }, 1000);

    return () => clearInterval(interval);
  }, [unlockTime]);

  const handleStake = async (e) => {
    console.log(contract);
    
    if (!signerContract) {
      setError('Wallet not connected or contract not ready');
      return;
    }
    console.log("staking: ", stakeAmount);
    e.preventDefault();
    setError('');
    setSuccess('');

    let amount;
    try {
      // Convert human-readable input to wei
      amount = BigInt(Math.floor(parseFloat(stakeAmount) * 1e18));
    } catch {
      setError('Please enter a valid amount');
      return;
    }
    if (amount <= 0n) {
      setError('Please enter a valid amount');
      return;
    }
    // Convert Redux balance to wei for comparison
    const balanceWei = BigInt(Math.floor(parseFloat(balance) * 1e18));
    if (amount > balanceWei) {
      setError('Insufficient balance');
      return;
    }
    setIsStaking(true);
    try {
      console.log("here");
      
      const tx = await signerContract.stake(amount);
      await tx.wait();
      
      setSuccess(`Successfully staked ${stakeAmount} tokens!`);
      // Convert from wei to human-readable for arithmetic
      const amountEther = Number(amount) / 1e18;
      // Update Redux state with human-readable strings
      dispatch(setTokenData({
        balance: (parseFloat(balance) - amountEther).toString(),
        stakedAmount: (parseFloat(stakedAmount) + amountEther).toString(),
        unlockTime: (Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7).toString(),
      }));
    } catch (err) {
      setError(err.reason || err.message || 'Stake failed');
    }
    setStakeAmount('');
    setIsStaking(false);
  };

  const handleUnstake = async (e) => {
    if (!signerContract) {
      setError('Wallet not connected or contract not ready');
      return;
    }
    e.preventDefault();
    setError('');
    setSuccess('');

    if (timeRemaining > 0) {
      setError(`Tokens are locked for ${formatDuration(timeRemaining)}`);
      return;
    }

  const amount = parseFloat(unstakeAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (amount > parseFloat(stakedAmount)) {
      setError('Insufficient staked amount');
      return;
    }

    setIsUnstaking(true);
    try {
      const tx = await signerContract.unstake();
      await tx.wait();
      setSuccess('Successfully unstaked tokens!');
      // Update Redux state directly (unstake all)
      dispatch(setTokenData({
        balance: (BigInt(balance) + BigInt(stakedAmount)).toString(),
        stakedAmount: '0',
        unlockTime: '0',
      }));
    } catch (err) {
      setError(err.reason || err.message || 'Unstake failed');
    }
    setUnstakeAmount('');
    setIsUnstaking(false);
  };

  const handleClaim = async () => {
    if (!signerContract) {
      setError('Wallet not connected or contract not ready');
      return;
    }
    setError('');
    setSuccess('');

    if (parseFloat(pendingRewards) <= 0) {
      setError('No rewards to claim');
      return;
    }

    setIsClaiming(true);
    try {
      const tx = await signerContract.claimRewards();
      await tx.wait();
      setSuccess('Successfully claimed rewards!');
      // Update Redux state directly
      dispatch(setTokenData({
        balance: (BigInt(balance) + BigInt(pendingRewards)).toString(),
        pendingRewards: '0',
      }));
    } catch (err) {
      setError(err.reason || err.message || 'Claim failed');
    }
    setIsClaiming(false);
  };
  // Check if user is contract owner
  useEffect(() => {
    const checkOwner = async () => {
      console.log(contract, address);
      
      if (!contract || !address) return;
      try {
        const owner = await contract.owner();
        setIsOwner(owner.toLowerCase() === address.toLowerCase());
        console.log({owner, address});
        
      } catch {}
    };
    checkOwner();
  }, [contract, address]);


  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold">Token Dashboard</h1>
        <p className="text-muted-foreground text-sm">Manage your VIBE tokens and rewards</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Coins}
          label="Total Balance"
          value={balance}
          suffix=" VIBE"
        />
        <StatCard
          icon={Lock}
          label="Staked Amount"
          value={stakedAmount}
          suffix=" VIBE"
        />
        <StatCard
          icon={Gift}
          label="Pending Rewards"
          value={pendingRewards}
          suffix=" VIBE"
        />
        <StatCard
          icon={TrendingUp}
          label="Voting Power"
          value={votingPower}
        />
      </div>

      {/* Stake Status */}
      {!isStakedEnough && (
        <div className="glass-card p-4 border-warning/50">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-warning">Stake Required for Voting</p>
              <p className="text-sm text-muted-foreground">
                Stake at least {MIN_STAKE.toLocaleString()} VIBE tokens to like posts and earn rewards from early likes.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Lock Status */}
      {timeRemaining > 0 && parseFloat(stakedAmount) > 0 && (
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-primary" />
            <div>
              <p className="font-medium">Tokens Locked</p>
              <p className="text-sm text-muted-foreground">
                Unlock in: {formatDuration(timeRemaining)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Alerts */}
      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 animate-slide-up">
          <p className="text-destructive text-sm">{error}</p>
        </div>
      )}
      {success && (
        <div className="p-4 rounded-xl bg-success/10 border border-success/20 flex items-center gap-2 animate-slide-up">
          <Check className="w-5 h-5 text-success" />
          <p className="text-success text-sm">{success}</p>
        </div>
      )}

      {/* Action Tabs */}
      <div className="glass-card overflow-hidden">
        <div className="flex border-b border-border">
          {['stake', 'unstake', 'rewards'].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setError('');
                setSuccess('');
              }}
              className={`flex-1 px-4 py-4 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-primary/10 text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
              }`}
            >
              {tab === 'stake' && <Lock className="w-4 h-4 inline mr-2" />}
              {tab === 'unstake' && <Unlock className="w-4 h-4 inline mr-2" />}
              {tab === 'rewards' && <Gift className="w-4 h-4 inline mr-2" />}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Stake Tab */}
          {activeTab === 'stake' && (
            <form onSubmit={handleStake} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Amount to Stake</label>
                <div className="relative">
                  <input
                    type="number"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    placeholder="0.00"
                    className="input-field pr-20"
                    min="0"
                    step="any"
                  />
                  <button
                    type="button"
                    onClick={() => setStakeAmount(balance)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-primary font-medium hover:underline"
                  >
                    MAX
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Available: {balance} VIBE
                </p>
              </div>

              <div className="p-4 rounded-xl bg-secondary/50 text-sm space-y-2">
                <p className="flex justify-between">
                  <span className="text-muted-foreground">Minimum stake</span>
                  <span>{MIN_STAKE.toLocaleString()} VIBE</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-muted-foreground">Lock period</span>
                  <span>7 days</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-muted-foreground">Your voting power</span>
                  <span className="text-primary">
                    {stakedAmount}
                  </span>
                </p>
              </div>

              <button
                type="submit"
                disabled={isStaking || !stakeAmount}
                className="btn-primary w-full flex items-center justify-center gap-2 text-primary-foreground disabled:opacity-50"
              >
                {isStaking ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Staking...
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    Stake Tokens
                  </>
                )}
              </button>
            </form>
          )}

          {/* Unstake Tab */}
          {activeTab === 'unstake' && (
            <form onSubmit={handleUnstake} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Amount to Unstake</label>
                <div className="relative">
                  <input
                    type="number"
                    value={unstakeAmount}
                    onChange={(e) => setUnstakeAmount(e.target.value)}
                    placeholder="0.00"
                    className="input-field pr-20"
                    min="0"
                    step="any"
                    disabled={timeRemaining > 0}
                  />
                  <button
                    type="button"
                    onClick={() => setUnstakeAmount(stakedAmount)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-primary font-medium hover:underline"
                    disabled={timeRemaining > 0}
                  >
                    MAX
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Staked: {stakedAmount} VIBE
                </p>
              </div>

              {timeRemaining > 0 && (
                <div className="p-4 rounded-xl bg-warning/10 border border-warning/20">
                  <p className="text-warning text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Tokens locked for {formatDuration(timeRemaining)}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isUnstaking || !unstakeAmount || timeRemaining > 0}
                className="btn-secondary w-full flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isUnstaking ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Unstaking...
                  </>
                ) : (
                  <>
                    <Unlock className="w-5 h-5" />
                    Unstake Tokens
                  </>
                )}
              </button>
            </form>
          )}

          {/* Rewards Tab */}
          {activeTab === 'rewards' && (
            <div className="space-y-4">
              <div className="text-center py-6">
                <p className="text-4xl font-display font-bold gradient-text mb-2">
                  {pendingRewards} VIBE
                </p>
                <p className="text-muted-foreground">Available to claim</p>
              </div>

              <div className="p-4 rounded-xl bg-secondary/50 text-sm space-y-3">
                <p className="font-medium mb-2">How rewards work:</p>
                <div className="space-y-2 text-muted-foreground">
                  <p>• Create popular posts to earn rewards</p>
                  <p>• Like trending posts early for bonus rewards</p>
                  <p>• Rewards are distributed weekly</p>
                  <p>• Higher stake = higher like weight = more rewards</p>
                </div>
              </div>

              <button
                onClick={handleClaim}
                disabled={isClaiming || parseFloat(pendingRewards) <= 0}
                className="btn-primary w-full flex items-center justify-center gap-2 text-primary-foreground disabled:opacity-50"
              >
                {isClaiming ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Claiming...
                  </>
                ) : (
                  <>
                    <Gift className="w-5 h-5" />
                    Claim Rewards
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

            {/* Distribute Rewards (owner only) */}
      {isOwner && (
        <div className="glass-card p-4 flex flex-col items-center">
          <button
            className="btn-primary mb-2"
            onClick={async () => {
              setError('');
              setSuccess('');
              try {
                const tx = await signerContract.distributeWeeklyRewards();
                await tx.wait();
                setSuccess('Rewards distributed!');
                // Optional: refetch token data here via contract
              } catch (err) {
                setError(err.reason || err.message || 'Distribute failed');
              }
            }}
          >
            Distribute Weekly Rewards
          </button>
          <p className="text-xs text-muted-foreground">Only contract owner can distribute rewards</p>
        </div>
      )}

      {/* Swap Widget */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-primary/10">
            <ArrowRightLeft className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-display font-semibold">Swap Tokens</h3>
            <p className="text-sm text-muted-foreground">Exchange VIBE ↔ ETH</p>
          </div>
        </div>

        <div className="p-8 rounded-xl bg-secondary/50 text-center">
          <p className="text-muted-foreground mb-4">
            Uniswap V3 swap widget will be integrated here
          </p>
          <a
            href="https://app.uniswap.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary inline-flex items-center gap-2"
          >
            Open Uniswap
            <ArrowRightLeft className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default TokenDashboard;
