import { Post } from "../models/post.model.js";
import fs from "node:fs/promises";
import path from "node:path";
import { BadRequestException } from "../exceptions/bad-request.exception.js";
import { NotFoundException } from "../exceptions/not-found.exception.js";
import { ForbiddenException } from "../exceptions/forbidden.exception.js";
import { sendEmail } from "../helpers/mail.helper.js";
import { PostView } from "../models/post-view.model.js";

class PostController {
  #_postModel;
  constructor() {
    this.#_postModel = Post;
  }

  getAll = async (req, res, next) => {
    const posts = await this.#_postModel.find();

    res.send({
      success: true,
      data: posts,
    });
  };

  getOne = async (req, res, next) => {
    try {
      const { id } = req.params;
      const post = await Post.findById(id);

      await PostView.create({
        postId: id,
        userId: req.user?.id,
      });

      res.send({ success: true, data: post });
    } catch (error) {
      next(error);
    }
  };

  create = async (req, res, next) => {
    try {
      const { title, content, created_by } = req.body;

      if (!req.files.image?.[0].filename) {
        throw new BadRequestException("Rasm berib yuborilishi shart");
      }

      const newPost = await this.#_postModel.insertOne({
        content,
        title,
        created_by,
        image_url: `/uploads/${req.files.image[0].filename}`,
        video_url: req.files?.video?.[0]?.filename
          ? `/uploads/${req.files?.video?.[0]?.filename}`
          : null,
      });

      sendEmail(
        "kebyu001@gmail.com",
        "Yangi post!",
        `Yangi post qo'shildi. ID: ${newPost._id}`,
      );

      res.send({
        success: true,
        data: newPost,
      });
    } catch (error) {
      // DELETE UNUSED IMAGES
      if (req.files?.image?.[0].filename) {
        await fs.unlink(
          path.join(process.cwd(), `/uploads/${req.files.image[0].filename}`),
        );
      }

      if (req.files?.video?.[0]?.filename) {
        await fs.unlink(
          path.join(process.cwd(), `/uploads/${req.files.video[0].filename}`),
        );
      }
      next(error);
    }
  };

  update = async (req, res, next) => {
    try {
      const { id } = req.params;
      const user = req.user;
      const { title, content } = req.body || {};

      const foundedPost = await this.#_postModel.findById(id);

      if (!foundedPost) {
        throw new NotFoundException("Post not found");
      }

      if (user.role !== "ADMIN" && foundedPost.created_by != user.id) {
        throw new ForbiddenException("You can only change your posts");
      }

      let imageUrl = foundedPost.image_url;
      let videoUrl = foundedPost.video_url;

      if (req.files?.image?.[0]?.filename) {
        if (foundedPost.image_url) {
          await fs.unlink(path.join(process.cwd(), foundedPost.image_url));
        }

        imageUrl = `/uploads/${req.files.image[0].filename}`;
      }

      if (req.files?.video?.[0]?.filename) {
        if (foundedPost.video_url) {
          await fs.unlink(path.join(process.cwd(), foundedPost.video_url));
        }

        videoUrl = `/uploads/${req.files.video[0].filename}`;
      }

      await this.#_postModel.updateOne(
        { _id: foundedPost._id },
        {
          title,
          content,
          image_url: imageUrl,
          video_url: videoUrl,
        },
      );

      res.status(204).send();
    } catch (error) {
      if (req.files?.image?.[0].filename) {
        await fs.unlink(
          path.join(process.cwd(), `/uploads/${req.files.image[0].filename}`),
        );
      }

      if (req.files?.video?.[0]?.filename) {
        await fs.unlink(
          path.join(process.cwd(), `/uploads/${req.files.video[0].filename}`),
        );
      }
      next(error);
    }
  };
}

export default new PostController();
