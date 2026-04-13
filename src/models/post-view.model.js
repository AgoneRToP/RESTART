import { Schema, model } from "mongoose";

const postViewSchema = new Schema({
  postId: {
    type: Schema.Types.ObjectId,
    ref: "Post",
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  viewedAt: {
    type: Date,
    default: Date.now,
  },
});

export const PostView = model("PostView", postViewSchema);