import { Wallet, Loader2, LogOut, ChevronDown } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useState, useRef, useEffect } from 'react';
import { shortenAddress } from '../utils/format';

const WalletButton = ({ onConnect, onDisconnect }) => {
  const { address, handle, isConnecting } = useSelector((state) => state.user);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (isConnecting) {
    return (
      <button className="btn-secondary flex items-center gap-2" disabled>
        <Loader2 className="w-5 h-5 animate-spin" />
        Connecting...
      </button>
    );
  }

  if (address) {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="btn-secondary flex items-center gap-2"
        >
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center text-xs text-primary-foreground font-bold">
            {handle?.[0]?.toUpperCase() || '?'}
          </div>
          <span>{handle ? `@${handle}` : shortenAddress(address)}</span>
          <ChevronDown className="w-4 h-4" />
        </button>

        {showDropdown && (
          <div className="absolute right-0 top-full mt-2 w-48 glass-card py-2 animate-scale-in">
            <div className="px-4 py-2 border-b border-border">
              <p className="text-sm font-medium">{handle ? `@${handle}` : 'No handle'}</p>
              <p className="text-xs text-muted-foreground">{shortenAddress(address)}</p>
            </div>
            <button
              onClick={() => {
                setShowDropdown(false);
                onDisconnect();
              }}
              className="w-full px-4 py-2 flex items-center gap-2 text-sm text-destructive hover:bg-secondary transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Disconnect
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <button onClick={onConnect} className="btn-primary flex items-center gap-2 text-primary-foreground">
      <Wallet className="w-5 h-5" />
      Connect Wallet
    </button>
  );
};

export default WalletButton;
