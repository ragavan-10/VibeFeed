import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Edit2, Copy, Check, ExternalLink, Image, Heart, Award, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { setUserData } from '../store/userSlice';
import { shortenAddress, formatNumber } from '../utils/format';
import PostCard from '../components/PostCard';
import EmptyState from '../components/EmptyState';
import { LoadingCard } from '../components/LoadingSpinner';
import { DEMO_MODE } from '../utils/mockData';

const Profile = () => {
  const dispatch = useDispatch();
  const { address, handle, myPostIds, myLikedPostIds } = useSelector((state) => state.user);
  const { byId } = useSelector((state) => state.posts);
  const { balance, stakedAmount, votingPower } = useSelector((state) => state.token);

  const [isEditingHandle, setIsEditingHandle] = useState(false);
  const [newHandle, setNewHandle] = useState(handle || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');

  // Get user's posts from Redux store
  const myPosts = myPostIds.map(id => byId[id]).filter(Boolean);
  const likedPosts = myLikedPostIds.map(id => byId[id]).filter(Boolean);

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUpdateHandle = async (e) => {
    e.preventDefault();
    if (!newHandle.trim() || newHandle === handle) {
      setIsEditingHandle(false);
      return;
    }

    setIsUpdating(true);
    
    if (DEMO_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      dispatch(setUserData({ handle: newHandle }));
    } else {
      // Real contract call would go here
      // await updateHandle(newHandle);
    }
    
    setIsUpdating(false);
    setIsEditingHandle(false);
  };

  const stats = [
    { label: 'Posts', value: myPostIds.length, icon: Image },
    { label: 'Likes Given', value: myLikedPostIds.length, icon: Heart },
    { label: 'Voting Power', value: votingPower, icon: Award },
  ];

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="glass-card p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center text-4xl text-primary-foreground font-bold shrink-0">
            {handle?.[0]?.toUpperCase() || '?'}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            {isEditingHandle ? (
              <form onSubmit={handleUpdateHandle} className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-xl text-muted-foreground">@</span>
                <input
                  type="text"
                  value={newHandle}
                  onChange={(e) => setNewHandle(e.target.value.toLowerCase())}
                  className="input-field py-2 flex-1 min-w-[150px]"
                  maxLength={20}
                  autoFocus
                  disabled={isUpdating}
                />
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="btn-primary py-2 text-sm text-primary-foreground"
                >
                  {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingHandle(false);
                    setNewHandle(handle);
                  }}
                  className="btn-secondary py-2 text-sm"
                >
                  Cancel
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-2xl font-display font-bold">@{handle}</h1>
                <button
                  onClick={() => setIsEditingHandle(true)}
                  className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
                >
                  <Edit2 className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            )}

            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="font-mono text-sm">{shortenAddress(address, 6)}</span>
              <button
                onClick={copyAddress}
                className="p-1 rounded hover:bg-secondary transition-colors"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-success" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
              <a
                href={`https://sepolia.etherscan.io/address/${address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 rounded hover:bg-secondary transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex gap-4 text-center">
            <div className="px-4 py-2 rounded-xl bg-secondary">
              <p className="text-lg font-bold">{parseFloat(balance).toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">Balance</p>
            </div>
            <div className="px-4 py-2 rounded-xl bg-secondary">
              <p className="text-lg font-bold">{parseFloat(stakedAmount).toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">Staked</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
          {stats.map(({ label, value, icon: Icon }) => (
            <div key={label} className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Icon className="w-4 h-4 text-primary" />
                <span className="text-xl font-bold">{formatNumber(value)}</span>
              </div>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-secondary/50 rounded-xl">
        <button
          onClick={() => setActiveTab('posts')}
          className={`tab-button flex-1 ${activeTab === 'posts' ? 'active' : ''}`}
        >
          <Image className="w-4 h-4 inline mr-2" />
          My Posts ({myPostIds.length})
        </button>
        <button
          onClick={() => setActiveTab('liked')}
          className={`tab-button flex-1 ${activeTab === 'liked' ? 'active' : ''}`}
        >
          <Heart className="w-4 h-4 inline mr-2" />
          Liked ({myLikedPostIds.length})
        </button>
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {activeTab === 'posts' ? (
          myPosts.length > 0 ? (
            myPosts.map((post, index) => (
              <div 
                key={post.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <PostCard post={post} compact />
              </div>
            ))
          ) : (
            <EmptyState
              icon={Image}
              title="No posts yet"
              description="Create your first post and start earning rewards!"
              actionLabel="Create Post"
              actionTo="/post/new"
            />
          )
        ) : likedPosts.length > 0 ? (
          likedPosts.map((post, index) => (
            <div 
              key={post.id}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <PostCard post={{ ...post, isLikedByMe: true }} compact />
            </div>
          ))
        ) : (
          <EmptyState
            icon={Heart}
            title="No liked posts"
            description="Like posts to support creators and earn rewards on trending content!"
            actionLabel="Explore Feed"
            actionTo="/feed"
          />
        )}
      </div>
    </div>
  );
};

export default Profile;
