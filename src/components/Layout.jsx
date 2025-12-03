import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Home, PlusCircle, User, Coins, TrendingUp, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { shortenAddress } from '../utils/format';

const navItems = [
  { path: '/feed', icon: Home, label: 'Feed' },
  { path: '/post/new', icon: PlusCircle, label: 'Create' },
  { path: '/profile', icon: User, label: 'Profile' },
  { path: '/token', icon: Coins, label: 'Token' },
];

const Layout = ({ children }) => {
  const location = useLocation();
  const { address, handle, isRegistered } = useSelector((state) => state.user);
  const { balance, stakedAmount } = useSelector((state) => state.token);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!isRegistered) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-hero-pattern pointer-events-none" />
      
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 flex-col border-r border-border bg-card/50 backdrop-blur-xl z-40">
        <div className="p-6">
          <Link to="/feed" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-2xl font-display font-bold gradient-text">Vibe</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map(({ path, icon: Icon, label }) => (
            <Link
              key={path}
              to={path}
              className={`nav-link ${location.pathname === path ? 'active' : ''}`}
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 m-4 glass-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center text-primary-foreground font-bold">
              {handle?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">@{handle}</p>
              <p className="text-xs text-muted-foreground">{shortenAddress(address)}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="p-2 rounded-lg bg-secondary/50">
              <p className="text-xs text-muted-foreground">Balance</p>
              <p className="font-semibold text-sm">{parseFloat(balance).toFixed(2)}</p>
            </div>
            <div className="p-2 rounded-lg bg-secondary/50">
              <p className="text-xs text-muted-foreground">Staked</p>
              <p className="font-semibold text-sm">{parseFloat(stakedAmount).toFixed(2)}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 border-b border-border bg-card/80 backdrop-blur-xl z-50 flex items-center justify-between px-4">
        <Link to="/feed" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-xl font-display font-bold gradient-text">Vibe</span>
        </Link>
        
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg hover:bg-secondary transition-colors"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-background/95 backdrop-blur-xl z-40 pt-16">
          <nav className="p-4 space-y-2">
            {navItems.map(({ path, icon: Icon, label }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setMobileMenuOpen(false)}
                className={`nav-link ${location.pathname === path ? 'active' : ''}`}
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </Link>
            ))}
          </nav>
          <div className="absolute bottom-4 left-4 right-4 glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center text-primary-foreground font-bold">
                {handle?.[0]?.toUpperCase() || '?'}
              </div>
              <div>
                <p className="font-semibold">@{handle}</p>
                <p className="text-xs text-muted-foreground">{shortenAddress(address)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 border-t border-border bg-card/80 backdrop-blur-xl z-40 flex items-center justify-around px-2">
        {navItems.map(({ path, icon: Icon, label }) => (
          <Link
            key={path}
            to={path}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
              location.pathname === path ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-xs">{label}</span>
          </Link>
        ))}
      </nav>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen pt-16 lg:pt-0 pb-20 lg:pb-0">
        <div className="max-w-4xl mx-auto p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
