import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Image, X, Upload, Loader2, ArrowLeft, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { addNewPost } from '../store/postsSlice';
import { addMyPostId } from '../store/userSlice';
import { uploadToIPFS } from '../utils/ipfs';
import { DEMO_MODE } from '../utils/mockData';

const CreatePost = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { handle, address } = useSelector((state) => state.user);
  const { isStakedEnough } = useSelector((state) => state.token);
  const { allIds } = useSelector((state) => state.posts);

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  
  const fileInputRef = useRef(null);

  const handleFileSelect = (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be less than 10MB');
      return;
    }

    setError('');
    setImage(file);

    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const removeImage = () => {
    setImage(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!image) {
      setError('Please select an image');
      return;
    }

    setIsUploading(true);
    try {
      // Upload to IPFS
      const cid = await uploadToIPFS(image);
      
      setIsUploading(false);
      setIsPosting(true);

      if (DEMO_MODE) {
        // Demo mode - create post locally
        await new Promise((resolve) => setTimeout(resolve, 1500));
        
        const newPostId = Math.max(...allIds, 0) + 1;
        
        const newPost = {
          id: newPostId,
          creator: address,
          handle,
          cid,
          points: 0,
          createdAt: Date.now(),
          isLikedByMe: false,
        };

        dispatch(addNewPost(newPost));
        dispatch(addMyPostId(newPostId));
        
        navigate(`/post/${newPostId}`);
      } else {
        // Real contract post creation would go here
        // const postId = await createPost(cid);
        navigate('/feed');
      }
    } catch (err) {
      console.error('Post creation error:', err);
      setError(err.reason || 'Failed to create post. Please try again.');
      setIsUploading(false);
      setIsPosting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/feed"
          className="p-2 rounded-lg hover:bg-secondary transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-display font-bold">Create Post</h1>
          <p className="text-muted-foreground text-sm">Share something amazing</p>
        </div>
      </div>

      {!isStakedEnough && (
        <div className="glass-card p-4 border-warning/50">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-warning shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-warning">Stake to enable likes</p>
              <p className="text-sm text-muted-foreground">
                You can create posts, but stake at least 1,000 tokens to like others' content.
              </p>
              <Link to="/token" className="text-sm text-primary hover:underline mt-1 inline-block">
                Go to Token Dashboard →
              </Link>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload */}
        <div className="glass-card p-6">
          <label className="block text-sm font-medium mb-3">Upload Image</label>
          
          {!preview ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300 ${
                dragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50 hover:bg-secondary/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileSelect(e.target.files[0])}
                className="hidden"
              />
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Drop your image here</p>
                  <p className="text-sm text-muted-foreground">or click to browse</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Supports: JPG, PNG, GIF, WebP • Max 10MB
                </p>
              </div>
            </div>
          ) : (
            <div className="relative rounded-xl overflow-hidden">
              <img
                src={preview}
                alt="Preview"
                className="w-full aspect-[4/3] object-cover"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-3 right-3 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-destructive hover:text-destructive-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Preview Card */}
        {preview && (
          <div className="glass-card p-5">
            <p className="text-sm text-muted-foreground mb-4">Preview</p>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center text-primary-foreground font-bold">
                {handle?.[0]?.toUpperCase() || '?'}
              </div>
              <div>
                <p className="font-semibold">@{handle}</p>
                <p className="text-xs text-muted-foreground">Just now</p>
              </div>
            </div>
            <div className="rounded-xl overflow-hidden">
              <img
                src={preview}
                alt="Preview"
                className="w-full aspect-[4/3] object-cover"
              />
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={!image || isUploading || isPosting}
          className="btn-primary w-full flex items-center justify-center gap-2 text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Uploading to IPFS...
            </>
          ) : isPosting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Creating post...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Publish Post
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default CreatePost;
