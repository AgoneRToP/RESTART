import { Router } from "express";
import postController from "../controllers/post.controller.js";
import { upload } from "../configs/multer.config.js";
import { Protected } from "../middlewares/protected.middleware.js";
import { Roles } from "../middlewares/roles.middleware.js";

const postRouter = Router();

// postRouter.post("/", upload.single("image") ,postController.create);
postRouter
  .get("/", Protected(false), Roles("VIEWER"), postController.getAll)
  .get("/:id", Protected(false), Roles("USER", "VIEWER"), postController.getOne)
  .post(
    "/",
    Protected(true),
    Roles("ADMIN", "USER"),
    upload.fields([
      { name: "image", maxCount: 1 },
      { name: "video", maxCount: 1 },
    ]),
    postController.create,
  )
  .patch(
    "/:id",
    Protected(true),
    Roles("ADMIN", "USER"),
    upload.fields([
      { name: "image", maxCount: 1 },
      { name: "video", maxCount: 1 },
    ]),
    postController.update,
  );

export default postRouter;
