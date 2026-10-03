require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Post = require("./models/Post");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors()); // allow the React app to call this API
app.use(express.json());

// Test route
app.get("/", (req, res) => res.send("Blog API is running"));

// CREATE a post
app.post("/api/posts", async (req, res, next) => {
  try {
    const post = await Post.create(req.body);
    res.status(201).json(post);
  } catch (err) {
    next(err);
  }
});

// READ all posts (newest first)
app.get("/api/posts", async (req, res, next) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    next(err);
  }
});

// UPDATE a post
app.put("/api/posts/:id", async (req, res, next) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!post) return res.status(404).json({ error: "Post not found" });
    res.json(post);
  } catch (err) {
    next(err);
  }
});

// DELETE a post
app.delete("/api/posts/:id", async (req, res, next) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });
    res.json({ message: "Post deleted" });
  } catch (err) {
    next(err);
  }
});

// Error-handling middleware
app.use((err, req, res, next) => {
  if (err.name === "ValidationError") {
    return res.status(400).json({ error: Object.values(err.errors).map((e) => e.message) });
  }
  if (err.name === "CastError") {
    return res.status(400).json({ error: "Invalid post id" });
  }
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});

// Connect to MongoDB, then start the server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error("MongoDB connection failed:", err.message));
