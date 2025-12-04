import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Heart, Share2, ExternalLink, ArrowLeft, Loader2, Clock, Award } from 'lucide-react';
import { likePost as likePostAction } from '../store/postsSlice';
import { addMyLikedPostId } from '../store/userSlice';
import { formatTimeAgo, formatNumber, shortenAddress, formatDateTime } from '../utils/format';
import { getIPFSUrl } from '../utils/ipfs';
import { LoadingScreen } from '../components/LoadingSpinner';
import { useWallet } from '../hooks/WalletContext.jsx';

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { byId } = useSelector((state) => state.posts);
  const { address, myLikedPostIds } = useSelector((state) => state.user);
  const { isStakedEnough } = useSelector((state) => state.token);

  const post = byId[parseInt(id)];
  const { signerContract, contract } = useWallet();
  const [isLiking, setIsLiking] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const isLikedByMe = myLikedPostIds.includes(parseInt(id));

  const handleLike = async () => {
    if (!post || isLikedByMe || isLiking || !isStakedEnough) return;
    setIsLiking(true);
    try {
      if (!signerContract) throw new Error('Connect wallet first');
      const tx = await signerContract.like(post.id);
      await tx.wait();
      // Refresh points from chain via read-only contract
      const [,, , points] = await contract.getPost(post.id);
      const formattedPoints = Number(points) / 1e18;
      dispatch(likePostAction({ id: post.id, points: formattedPoints }));
      dispatch(addMyLikedPostId(post.id));
    } catch (e) {
      // optional: surface error to UI
      console.error('Like error:', e);
    }
    setIsLiking(false);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Post by @${post?.handle}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (!post) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-display font-bold mb-2">Post not found</h2>
        <p className="text-muted-foreground mb-6">This post may have been removed.</p>
        <Link to="/feed" className="btn-primary inline-flex text-primary-foreground">
          Back to Feed
        </Link>
      </div>
    );
  }

  const canLike = isStakedEnough && address && !isLikedByMe && post.creator !== address;
  const imageUrl = getIPFSUrl(post.cid, post.id);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-secondary transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-display font-bold">Post</h1>
      </div>

      {/* Post */}
      <article className="glass-card overflow-hidden animate-scale-in">
        {/* Creator Info */}
        <div className="p-5 border-b border-border">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center text-primary-foreground font-bold text-lg shrink-0">
              {post.handle?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-lg">
                @{post.handle || shortenAddress(post.creator)}
              </p>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatDateTime(post.createdAt)}
                </span>
                <span className="flex items-center gap-1">
                  <Award className="w-4 h-4" />
                  {formatNumber(post.points)} points
                </span>
              </div>
            </div>
            <a
              href={`https://sepolia.etherscan.io/address/${post.creator}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
            >
              <ExternalLink className="w-5 h-5 text-muted-foreground" />
            </a>
          </div>
        </div>

        {/* Image */}
        <div className="relative bg-secondary">
          {!imageLoaded && (
            <div className="aspect-square flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}
          <img
            src={imageUrl}
            alt={`Post by ${post.handle}`}
            className={`w-full ${imageLoaded ? 'block' : 'hidden'}`}
            onLoad={() => setImageLoaded(true)}
          />
        </div>

        {/* Actions */}
        <div className="p-5">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={handleLike}
              disabled={!canLike || isLiking}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all duration-200 ${
                isLikedByMe
                  ? 'bg-primary/20 text-primary'
                  : canLike
                  ? 'bg-secondary hover:bg-primary/10 hover:text-primary'
                  : 'bg-secondary/50 text-muted-foreground cursor-not-allowed'
              }`}
            >
              {isLiking ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Heart className={`w-5 h-5 ${isLikedByMe ? 'fill-current' : ''}`} />
              )}
              <span>{formatNumber(post.points)} Likes</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-5 py-3 rounded-xl font-medium bg-secondary hover:bg-secondary/80 transition-colors"
            >
              <Share2 className="w-5 h-5" />
              Share
            </button>
          </div>

          {!isStakedEnough && address && (
            <p className="text-sm text-muted-foreground pt-4 border-t border-border">
              <Link to="/token" className="text-primary hover:underline">
                Stake at least 1,000 tokens
              </Link>{' '}
              to like this post
            </p>
          )}
        </div>
      </article>

      {/* IPFS Info */}
      <div className="glass-card p-5 animate-slide-up" style={{ animationDelay: '100ms' }}>
        <h3 className="font-display font-semibold mb-3">Content Details</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Post ID</span>
            <span className="font-mono">#{post.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">IPFS CID</span>
            <span className="font-mono text-primary truncate max-w-[200px]">
              {post.cid}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Creator</span>
            <a
              href={`https://sepolia.etherscan.io/address/${post.creator}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-primary hover:underline"
            >
              {shortenAddress(post.creator)}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
