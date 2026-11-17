import { Router } from "express";
import {
  loginUserController,
  getUserDetailsController,
} from "../controllers/user.controller.js";
import { protect } from "../middleware/auth.js";

const userRouter = Router();

userRouter.post("/login", loginUserController);
userRouter.get("/me", protect, getUserDetailsController);

export default userRouter;
