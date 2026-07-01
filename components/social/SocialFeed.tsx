"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, Share2, Loader2, ImagePlus, Send } from "lucide-react";
import toast from "react-hot-toast";
import { postsAPI, uploadAPI } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { VerifiedBadge } from "@/components/social/VerifiedBadge";
import {
  AnimatedButton,
  EmptyState,
  GlassCard,
  LoadingSkeleton,
  StaggerReveal,
  StaggerRevealItem,
} from "@/components/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface Post {
  _id: string;
  content: string;
  images?: string[];
  destination?: string;
  likes: string[];
  shareCount: number;
  commentCount: number;
  createdAt: string;
  user: { _id: string; name: string; avatar?: string; isVerified?: boolean };
}

interface Comment {
  _id: string;
  content: string;
  user: { name: string; avatar?: string; isVerified?: boolean };
  createdAt: string;
}

export function SocialFeed() {
  const user = useAuthStore((s) => s.user);
  const reduced = useReducedMotion();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [destination, setDestination] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Record<string, Comment[]>>({});
  const [commentDraft, setCommentDraft] = useState<Record<string, string>>({});

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await postsAPI.feed();
      setPosts(data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const createPost = async () => {
    if (!user) {
      toast.error("Log in to post");
      return;
    }
    if (!content.trim()) return;
    try {
      await postsAPI.create({ content, destination, images });
      setContent("");
      setDestination("");
      setImages([]);
      toast.success("Posted!");
      load();
    } catch {
      toast.error("Couldn't post");
    }
  };

  const onImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { data } = await uploadAPI.image(file);
      setImages((prev) => [...prev, data.url]);
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const toggleLike = async (post: Post) => {
    if (!user) {
      toast.error("Log in to like");
      return;
    }
    const { data } = await postsAPI.like(post._id);
    setPosts((prev) =>
      prev.map((p) =>
        p._id === post._id
          ? { ...p, likes: data.liked ? [...p.likes, user._id] : p.likes.filter((id) => id !== user._id) }
          : p
      )
    );
  };

  const share = async (id: string) => {
    await postsAPI.share(id);
    navigator.clipboard.writeText(`${window.location.origin}/community`);
    toast.success("Link copied!");
    load();
  };

  const loadComments = async (postId: string) => {
    if (expandedComments[postId]) {
      setExpandedComments((e) => {
        const n = { ...e };
        delete n[postId];
        return n;
      });
      return;
    }
    const { data } = await postsAPI.getComments(postId);
    setExpandedComments((e) => ({ ...e, [postId]: data.data }));
  };

  const addComment = async (postId: string) => {
    const c = commentDraft[postId]?.trim();
    if (!c) return;
    const { data } = await postsAPI.addComment(postId, c);
    setExpandedComments((e) => ({ ...e, [postId]: [...(e[postId] || []), data.data] }));
    setCommentDraft((d) => ({ ...d, [postId]: "" }));
    setPosts((prev) => prev.map((p) => (p._id === postId ? { ...p, commentCount: p.commentCount + 1 } : p)));
  };

  return (
    <div className="pt-[88px] max-w-[640px] mx-auto px-4 sm:px-6 pb-16">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black text-text-dark tracking-tight">Travel Community</h1>
        <p className="text-text-grey mt-1">Share stories, photos & tips from the road.</p>
      </div>

      {user && (
        <GlassCard className="p-4 mb-6 border border-[#EBEBEB]/80">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            placeholder="Share your travel moment…"
            className="w-full resize-none outline-none text-sm bg-transparent"
          />
          <input
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Destination (optional)"
            className="w-full mt-2 text-sm border-b border-[#EBEBEB] py-1 outline-none bg-transparent"
          />
          {images.length > 0 && (
            <div className="flex gap-2 mt-2 flex-wrap">
              {images.map((url) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={url} src={url} alt="" className="h-16 w-16 object-cover rounded-lg shadow-sm" />
              ))}
            </div>
          )}
          <div className="flex items-center justify-between mt-3">
            <label className="cursor-pointer text-text-grey hover:text-green-dark transition-colors">
              {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
              <input type="file" accept="image/*" className="hidden" onChange={onImage} />
            </label>
            <AnimatedButton size="sm" onClick={createPost}>
              Post
            </AnimatedButton>
          </div>
        </GlassCard>
      )}

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border border-[#EBEBEB] rounded-2xl p-4 space-y-3">
              <div className="flex gap-2">
                <LoadingSkeleton className="h-9 w-9 rounded-full" rounded="full" />
                <LoadingSkeleton className="h-4 w-32" />
              </div>
              <LoadingSkeleton className="h-3 w-full" />
              <LoadingSkeleton className="h-3 w-4/5" />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <EmptyState
          icon="📸"
          title="No posts yet"
          description="Be the first to share a travel story with the community."
        />
      ) : (
        <StaggerReveal className="space-y-4">
          {posts.map((post) => {
            const liked = user && post.likes.includes(user._id);
            return (
              <StaggerRevealItem key={post._id}>
                <article className="border border-[#EBEBEB] rounded-2xl p-4 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-shadow duration-300">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="h-9 w-9 rounded-full bg-green-dark text-white flex items-center justify-center font-bold text-sm shadow-sm">
                      {post.user.name.charAt(0)}
                    </span>
                    <div>
                      <p className="font-semibold text-sm flex items-center gap-1">
                        {post.user.name}
                        {post.user.isVerified && <VerifiedBadge className="!text-[10px]" />}
                      </p>
                      {post.destination && <p className="text-xs text-text-grey">{post.destination}</p>}
                    </div>
                  </div>
                  <p className="text-sm text-text-dark whitespace-pre-wrap leading-relaxed">{post.content}</p>
                  {post.images?.map((url) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <motion.img
                      key={url}
                      src={url}
                      alt=""
                      className="mt-3 rounded-xl w-full max-h-80 object-cover"
                      initial={reduced ? false : { opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: reduced ? 0 : 0.4 }}
                    />
                  ))}
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[#F2F2F2]">
                    <button
                      onClick={() => toggleLike(post)}
                      className={`flex items-center gap-1 text-sm transition-colors ${liked ? "text-red-500" : "text-text-grey hover:text-red-400"}`}
                    >
                      <motion.span whileTap={reduced ? undefined : { scale: 1.3 }}>
                        <Heart className={`h-4 w-4 ${liked ? "fill-red-500" : ""}`} />
                      </motion.span>{" "}
                      {post.likes.length}
                    </button>
                    <button
                      onClick={() => loadComments(post._id)}
                      className="flex items-center gap-1 text-sm text-text-grey hover:text-green-dark transition-colors"
                    >
                      <MessageCircle className="h-4 w-4" /> {post.commentCount}
                    </button>
                    <button
                      onClick={() => share(post._id)}
                      className="flex items-center gap-1 text-sm text-text-grey hover:text-green-dark transition-colors ml-auto"
                    >
                      <Share2 className="h-4 w-4" /> {post.shareCount || ""}
                    </button>
                  </div>
                  <AnimatePresence>
                    {expandedComments[post._id] && (
                      <motion.div
                        initial={reduced ? false : { height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={reduced ? undefined : { height: 0, opacity: 0 }}
                        transition={{ duration: reduced ? 0 : 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 space-y-2 pl-2 border-l-2 border-green-neon/30">
                          {expandedComments[post._id].map((c) => (
                            <div key={c._id} className="text-sm">
                              <span className="font-semibold">{c.user.name}</span> {c.content}
                            </div>
                          ))}
                          {user && (
                            <div className="flex gap-2 items-center">
                              <input
                                value={commentDraft[post._id] || ""}
                                onChange={(e) => setCommentDraft((d) => ({ ...d, [post._id]: e.target.value }))}
                                onKeyDown={(e) => e.key === "Enter" && addComment(post._id)}
                                placeholder="Add a comment…"
                                aria-label="Comment"
                                className="flex-1 text-sm border rounded-full px-3 py-1.5 outline-none focus:border-green-dark transition-colors min-h-[40px]"
                              />
                              <button
                                type="button"
                                onClick={() => addComment(post._id)}
                                disabled={!commentDraft[post._id]?.trim()}
                                className="touch-target rounded-full bg-green-neon text-white flex items-center justify-center min-h-[40px] min-w-[40px] disabled:opacity-40 hover:bg-green-dark transition-colors"
                                aria-label="Post comment"
                              >
                                <Send className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </article>
              </StaggerRevealItem>
            );
          })}
        </StaggerReveal>
      )}
    </div>
  );
}
