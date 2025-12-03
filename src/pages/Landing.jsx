import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Wallet, TrendingUp, Zap, Shield, Users, Loader2, ArrowRight, Sparkles } from 'lucide-react';
import { setUserData, setIsConnecting } from '../store/userSlice';
import { setTokenData } from '../store/tokenSlice';
import { setPosts, setTrendingIds } from '../store/postsSlice';
import { mockPosts, mockUserData, DEMO_MODE } from '../utils/mockData';
import WalletButton from '../components/WalletButton';
import heroBg from '../assets/hero-bg.png';

const Landing = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { address, isRegistered, isConnecting } = useSelector((state) => state.user);
  
  const [handle, setHandle] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isRegistered) {
      navigate('/feed');
    }
  }, [isRegistered, navigate]);

  const connectWallet = async () => {
    dispatch(setIsConnecting(true));

    if (DEMO_MODE) {
      // Demo mode - simulate wallet connection
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      const demoAddress = '0x' + Array.from({ length: 40 }, () => 
        Math.floor(Math.random() * 16).toString(16)
      ).join('');

      dispatch(setUserData({
        address: demoAddress,
        isRegistered: false,
      }));
      dispatch(setIsConnecting(false));
      return;
    }

    // Real wallet connection
    if (!window.ethereum) {
      setError('Please install MetaMask');
      dispatch(setIsConnecting(false));
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      dispatch(setUserData({
        address: accounts[0],
        isRegistered: false, // Will check registration status
      }));
    } catch (err) {
      setError(err.message);
    }
    dispatch(setIsConnecting(false));
  };

  const disconnectWallet = () => {
    dispatch(setUserData({
      address: null,
      handle: null,
      isRegistered: false,
      myPostIds: [],
      myLikedPostIds: [],
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!handle.trim()) {
      setError('Please enter a handle');
      return;
    }

    if (handle.length < 3 || handle.length > 20) {
      setError('Handle must be 3-20 characters');
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(handle)) {
      setError('Handle can only contain letters, numbers, and underscores');
      return;
    }

    setIsRegistering(true);
    
    if (DEMO_MODE) {
      // Demo mode - simulate registration
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      dispatch(setUserData({
        handle,
        isRegistered: true,
        myPostIds: [],
        myLikedPostIds: [2, 5],
      }));

      dispatch(setTokenData(mockUserData));
      dispatch(setPosts(mockPosts));
      dispatch(setTrendingIds([5, 3, 1]));
      
      navigate('/feed');
    } else {
      // Real contract registration would go here
      try {
        // await registerUser(handle);
        navigate('/feed');
      } catch (err) {
        console.error('Registration error:', err);
        setError(err.reason || 'Registration failed. Try a different handle.');
      }
    }
    
    setIsRegistering(false);
  };

  const features = [
    {
      icon: Zap,
      title: 'Earn Rewards',
      description: 'Get tokens for creating popular content and early likes on trending posts',
    },
    {
      icon: Shield,
      title: 'Stake to Vote',
      description: 'Stake tokens to gain voting power and influence which content trends',
    },
    {
      icon: Users,
      title: 'Community Driven',
      description: 'Fully decentralized platform owned and governed by users',
    },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Hero Background Image */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      
      {/* Animated background overlays */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-pink-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 lg:px-12">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-2xl font-display font-bold gradient-text">Vibe</span>
        </div>
        
        {DEMO_MODE && (
          <span className="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-warning/20 text-warning text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-warning animate-pulse" />
            Demo Mode
          </span>
        )}
        
        <WalletButton onConnect={connectWallet} onDisconnect={disconnectWallet} />
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 pt-16 lg:pt-24 pb-20">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6 animate-fade-in">
            <Sparkles className="w-4 h-4" />
            Decentralized Social Media
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-display font-bold mb-6 leading-tight animate-slide-up">
            Create, Share & <br />
            <span className="gradient-text">Earn Together</span>
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '100ms' }}>
            The first fully decentralized content platform where creators earn rewards,
            and early supporters share in the success of trending content.
          </p>

          {!address ? (
            <button
              onClick={connectWallet}
              disabled={isConnecting}
              className="btn-primary inline-flex items-center gap-3 text-lg px-8 py-4 text-primary-foreground animate-scale-in"
              style={{ animationDelay: '200ms' }}
            >
              {isConnecting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Wallet className="w-5 h-5" />
                  Connect Wallet to Start
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          ) : (
            <form onSubmit={handleRegister} className="max-w-md mx-auto animate-scale-in">
              <div className="glass-card p-6">
                <h2 className="text-xl font-display font-bold mb-2">Choose Your Handle</h2>
                <p className="text-muted-foreground text-sm mb-4">
                  This will be your unique identity on Vibe
                </p>
                
                <div className="relative mb-4">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
                  <input
                    type="text"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value.toLowerCase())}
                    placeholder="yourhandle"
                    className="input-field pl-8"
                    maxLength={20}
                    disabled={isRegistering}
                  />
                </div>

                {error && (
                  <p className="text-destructive text-sm mb-4">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={isRegistering || !handle.trim()}
                  className="btn-primary w-full flex items-center justify-center gap-2 text-primary-foreground"
                >
                  {isRegistering ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, description }, index) => (
            <div
              key={title}
              className="glass-card-hover p-6 animate-slide-up"
              style={{ animationDelay: `${(index + 3) * 100}ms` }}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-pink-500/20 flex items-center justify-center mb-4">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-display font-bold mb-2">{title}</h3>
              <p className="text-muted-foreground text-sm">{description}</p>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { value: '10K+', label: 'Creators' },
            { value: '250K+', label: 'Posts' },
            { value: '$1.2M', label: 'Rewards Distributed' },
            { value: '98%', label: 'User Satisfaction' },
          ].map(({ value, label }, index) => (
            <div 
              key={label} 
              className="text-center animate-fade-in"
              style={{ animationDelay: `${(index + 6) * 100}ms` }}
            >
              <p className="text-3xl lg:text-4xl font-display font-bold gradient-text">{value}</p>
              <p className="text-muted-foreground text-sm">{label}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border py-6 px-6 text-center text-muted-foreground text-sm">
        <p>Built on Ethereum Sepolia • Powered by the Community</p>
      </footer>
    </div>
  );
};

export default Landing;
