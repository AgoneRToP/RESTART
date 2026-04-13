import mongoose from "mongoose";

const PostSchema = new mongoose.Schema(
  {
    title: {
      type: mongoose.SchemaTypes.String,
      required: true,
    },
    content: {
      type: mongoose.SchemaTypes.String,
      required: true,
    },
    video_url: {
      type: mongoose.SchemaTypes.String,
    },
    image_url: {
      type: mongoose.SchemaTypes.String,
      required: true,
    },
    created_by: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
    },
  },
  {
    collection: "posts",
    versionKey: false,
    timestamps: true,
  },
);

export const Post = mongoose.model("Post", PostSchema);
