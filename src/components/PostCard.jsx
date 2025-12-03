import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Share2, ExternalLink, Loader2 } from 'lucide-react';
import { useSelector } from 'react-redux';
import { formatTimeAgo, formatNumber, shortenAddress } from '../utils/format';
import { getIPFSUrl } from '../utils/ipfs';

const PostCard = ({ post, onLike, compact = false }) => {
  const [isLiking, setIsLiking] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { isStakedEnough } = useSelector((state) => state.token);
  const { address } = useSelector((state) => state.user);

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (post.isLikedByMe || isLiking || !onLike) return;
    
    setIsLiking(true);
    try {
      await onLike(post.id);
    } catch (error) {
      console.error('Like error:', error);
    }
    setIsLiking(false);
  };

  const handleShare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (navigator.share) {
      navigator.share({
        title: `Post by @${post.handle}`,
        url: `${window.location.origin}/post/${post.id}`,
      });
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
    }
  };

  const canLike = isStakedEnough && address && !post.isLikedByMe && post.creator !== address;
  const imageUrl = getIPFSUrl(post.cid, post.id);

  return (
    <Link to={`/post/${post.id}`}>
      <article className={`glass-card-hover overflow-hidden ${compact ? 'p-4' : 'p-5'}`}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center text-primary-foreground font-bold shrink-0">
            {post.handle?.[0]?.toUpperCase() || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">@{post.handle || shortenAddress(post.creator)}</p>
            <p className="text-xs text-muted-foreground">{formatTimeAgo(post.createdAt)}</p>
          </div>
          <span className="badge-primary">{formatNumber(post.points)} pts</span>
        </div>

        {/* Image */}
        <div className={`relative rounded-xl overflow-hidden bg-secondary mb-4 ${compact ? 'aspect-video' : 'aspect-[4/3]'}`}>
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          <img
            src={imageUrl}
            alt={`Post by ${post.handle}`}
            className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageError(true);
              setImageLoaded(true);
            }}
          />
          {imageError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-secondary to-muted">
              <span className="text-muted-foreground text-sm">Image unavailable</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleLike}
            disabled={!canLike || isLiking}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
              post.isLikedByMe
                ? 'bg-primary/20 text-primary'
                : canLike
                ? 'hover:bg-secondary text-muted-foreground hover:text-primary'
                : 'text-muted-foreground/50 cursor-not-allowed'
            }`}
          >
            {isLiking ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Heart className={`w-5 h-5 ${post.isLikedByMe ? 'fill-current' : ''}`} />
            )}
            <span className="text-sm font-medium">{formatNumber(post.points)}</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          >
            <Share2 className="w-5 h-5" />
            <span className="text-sm font-medium">Share</span>
          </button>

          <div className="flex-1" />

          <ExternalLink className="w-4 h-4 text-muted-foreground" />
        </div>

        {/* Stake requirement notice */}
        {!isStakedEnough && address && (
          <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
            Stake at least 1,000 tokens to like posts
          </p>
        )}
      </article>
    </Link>
  );
};

export default PostCard;
