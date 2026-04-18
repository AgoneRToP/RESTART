import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { Post } from "../models/post.model.js";

const router = express.Router();

// Обработка регистрации
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Проверяем, существует ли пользователь
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).render("register", { error: "Email уже занят" });
    }
    
    // Хешируем пароль и сохраняем
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();
    
    res.redirect("/auth/login");
    res.render("register");
  } catch (err) {
    res.status(500).render("register", { error: "Ошибка при регистрации" });
  }
});

// Обработка логина
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).render("login", { error: "Неверный email или пароль" });
    }
    
    // Создаем JWT (или можно использовать express-session)
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    
    // Сохраняем токен в куки (нужен cookie-parser)
    res.cookie("token", token, { httpOnly: true });
    res.redirect("/");
    res.render("login");
  } catch (err) {
    res.status(500).render("login", { error: "Ошибка при входе" });
  }
});

router.get("/", async (req, res) => {
  try {
    const posts = await Post.find()
    .populate("created_by", "name")
    .sort({
        createdAt: -1,
      })
      .lean();

      res.render("home", { posts });

    res.clearCookie("token");
    res.redirect("/auth/login");
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to load posts.",
      error: err.message,
    });
  }
});

router.get("/posts/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("create_by", "name")
      .lean();

    if (!post)
      return res.status(404).render("error", { message: "Post not found" });

    res.render("post", { post });
  } catch (err) {
    console.error(err);
    res.status(500).render("error", { message: "Failed to load post" });
  }
});

export default router;
