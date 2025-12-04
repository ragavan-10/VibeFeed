import { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Search, TrendingUp, Clock, Award, Plus, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { likePost as likePostAction } from '../store/postsSlice';
import { addMyLikedPostId as addUserLikedPostId } from '../store/userSlice';
import PostCard from '../components/PostCard';
import EmptyState from '../components/EmptyState';
import { LoadingCard } from '../components/LoadingSpinner';
import { useWallet } from '../hooks/WalletContext.jsx';



const TABS = [
  { id: 'top', label: 'Top', icon: Award },
  { id: 'trending', label: 'Trending', icon: TrendingUp },
  { id: 'new', label: 'New', icon: Clock },
];

const Feed = () => {
  const dispatch = useDispatch();
  const { byId, allIds, trendingIds, isLoading, hasMore } = useSelector((state) => state.posts);
  const { myLikedPostIds, address } = useSelector((state) => state.user);
  
  const [activeTab, setActiveTab] = useState('top');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const loadingRef = useRef(null);

  const { signerContract, contract, address: walletAddress, fetchUserData, shouldFetchFullData, setShouldFetchFullData } = useWallet();

  // Load user data on mount and when connection changes
  useEffect(() => {
    if (walletAddress && contract && dispatch) {
      fetchUserData(walletAddress, contract, dispatch);
      // Reset flag if it was set
      if (shouldFetchFullData) {
        setShouldFetchFullData(false);
      }
    }
  }, [walletAddress, contract, dispatch]); // Fetch when wallet/contract available

  // Also trigger fetch when shouldFetchFullData flag is explicitly set
  useEffect(() => {
    if (walletAddress && contract && dispatch && shouldFetchFullData) {
      fetchUserData(walletAddress, contract, dispatch);
      setShouldFetchFullData(false);
    }
  }, [shouldFetchFullData]); // Only when flag changes

  // Get posts based on tab
  const getDisplayPosts = useCallback(() => {
    let postIds = activeTab === 'trending' ? trendingIds : allIds;
    let posts = postIds.map((id) => {
      const post = byId[id];
      if (!post) return null;
      return {
        ...post,
        isLikedByMe: myLikedPostIds.includes(post.id),
      };
    }).filter(Boolean);

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      posts = posts.filter(
        (post) =>
          post.handle?.toLowerCase().includes(query) ||
          post.creator?.toLowerCase().includes(query)
      );
    }

    // Sort based on tab
    if (activeTab === 'new') {
      posts.sort((a, b) => b.createdAt - a.createdAt);
    } else if (activeTab === 'top') {
      posts.sort((a, b) => b.points - a.points);
    }

    return posts;
  }, [activeTab, allIds, trendingIds, byId, searchQuery, myLikedPostIds]);

  const displayPosts = getDisplayPosts();

  const handleLike = async (postId) => {
    try {
      if (!signerContract) throw new Error('Connect wallet first');
      const tx = await signerContract.like(postId);
      await tx.wait();
  // Optimistically update UI by refetching points via getPost
  const [,, , points] = await contract.getPost(postId);
  // Format points to human-readable units (divide by 1e18)
  const formattedPoints = Number(points) / 1e18;
  dispatch(likePostAction({ id: postId, points: formattedPoints }));
      dispatch(addUserLikedPostId(postId));
    } catch (error) {
      console.error('Like error:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Feed</h1>
          <p className="text-muted-foreground text-sm">Discover what's trending on Vibe</p>
        </div>
        <Link to="/post/new" className="btn-primary flex items-center gap-2 text-primary-foreground w-full sm:w-auto justify-center">
          <Plus className="w-5 h-5" />
          Create Post
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by handle or address..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input-field pl-12"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-secondary/50 rounded-xl">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`tab-button flex-1 flex items-center justify-center gap-2 ${
              activeTab === id ? 'active' : ''
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {isLoading && displayPosts.length === 0 ? (
          <>
            <LoadingCard />
            <LoadingCard />
            <LoadingCard />
          </>
        ) : displayPosts.length > 0 ? (
          <>
            {displayPosts.map((post, index) => (
              <div 
                key={post.id} 
                className="animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <PostCard post={post} onLike={handleLike} />
              </div>
            ))}
            
            {/* Infinite scroll trigger */}
            {hasMore && activeTab === 'new' && (
              <div ref={loadingRef} className="py-8 flex justify-center">
                {isLoading && <Loader2 className="w-6 h-6 animate-spin text-primary" />}
              </div>
            )}
          </>
        ) : (
          <EmptyState
            icon={TrendingUp}
            title="No posts yet"
            description={
              searchQuery
                ? 'No posts match your search. Try different keywords.'
                : 'Be the first to create a post and start earning rewards!'
            }
            actionLabel={searchQuery ? undefined : 'Create First Post'}
            actionTo={searchQuery ? undefined : '/post/new'}
          />
        )}
      </div>
    </div>
  );
};

export default Feed;
