import express from "express";
import jwt from "jsonwebtoken";
import jwtConfig from "../configs/jwt.config.js";
import { Post } from "../models/post.model.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const token = req.signedCookies.accessToken;

  if (!token) return res.redirect("/login");

  try {
    jwt.verify(token, jwtConfig.accessKey);

    const posts = await Post.find()
      .populate("created_by", "name")
      .sort({ createdAt: -1 })
      .lean();

    res.render("home", { posts, cssFile: "home" });
  } catch (err) {
    res.redirect("/login");
  }
});

router.get("/posts/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("created_by", "name")
      .lean();

    if (!post)
      return res.status(404).render("error", { message: "Post not found" });

    res.render("post", { post, cssFile: "post" });
  } catch (err) {
    res.status(500).render("error", { message: "Failed to load post" });
  }
});

export default router;
