const Post = require("../models/Post");
const Comment = require("../models/Comment");
const { notify } = require("../utils/notify");

// GET /api/posts
exports.feed = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = 20;
    const posts = await Post.find()
      .populate("user", "name avatar isVerified trustScore")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    res.json({ success: true, data: posts, pagination: { page, limit } });
  } catch (err) {
    next(err);
  }
};

// POST /api/posts  { content, images, destination }
exports.create = async (req, res, next) => {
  try {
    const { content, images, destination } = req.body;
    if (!content?.trim()) return res.status(400).json({ success: false, message: "content required" });
    const post = await Post.create({
      user: req.user._id,
      content: content.trim(),
      images: images || [],
      destination,
    });
    await post.populate("user", "name avatar isVerified trustScore");
    res.status(201).json({ success: true, data: post });
  } catch (err) {
    next(err);
  }
};

// POST /api/posts/:id/like
exports.toggleLike = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: "Post not found" });
    const uid = String(req.user._id);
    const idx = post.likes.findIndex((id) => String(id) === uid);
    let liked;
    if (idx >= 0) {
      post.likes.splice(idx, 1);
      liked = false;
    } else {
      post.likes.push(req.user._id);
      liked = true;
      if (String(post.user) !== uid) {
        await notify(req.app, {
          user: post.user,
          type: "social",
          title: "Someone liked your post",
          body: `${req.user.name} liked your travel post`,
          link: "/community",
        });
      }
    }
    await post.save();
    res.json({ success: true, liked, likeCount: post.likes.length });
  } catch (err) {
    next(err);
  }
};

// POST /api/posts/:id/share
exports.share = async (req, res, next) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, { $inc: { shareCount: 1 } }, { new: true });
    if (!post) return res.status(404).json({ success: false, message: "Post not found" });
    res.json({ success: true, shareCount: post.shareCount });
  } catch (err) {
    next(err);
  }
};

// GET /api/posts/:id/comments
exports.getComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ post: req.params.id })
      .populate("user", "name avatar isVerified")
      .sort({ createdAt: 1 });
    res.json({ success: true, data: comments });
  } catch (err) {
    next(err);
  }
};

// POST /api/posts/:id/comments  { content }
exports.addComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ success: false, message: "content required" });
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: "Post not found" });

    const comment = await Comment.create({
      post: post._id,
      user: req.user._id,
      content: content.trim(),
    });
    post.commentCount += 1;
    await post.save();
    await comment.populate("user", "name avatar isVerified");

    if (String(post.user) !== String(req.user._id)) {
      await notify(req.app, {
        user: post.user,
        type: "social",
        title: "New comment on your post",
        body: `${req.user.name}: ${content.slice(0, 50)}`,
        link: "/community",
      });
    }

    res.status(201).json({ success: true, data: comment });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/posts/:id
exports.remove = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: "Not found" });
    if (String(post.user) !== String(req.user._id) && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not your post" });
    }
    await Comment.deleteMany({ post: post._id });
    await post.deleteOne();
    res.json({ success: true, message: "Post deleted" });
  } catch (err) {
    next(err);
  }
};
