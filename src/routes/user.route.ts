import express from "express";
import userController from "../controller/user.controller";
import validator from "../utils/validator";
import authMiddleware from "../middleware/auth.middleware";
let userRouter = express.Router();

userRouter.post("/sign-up", validator.signUpValidator, userController.signUp);
userRouter.post("/login", validator.loginValidator, userController.login);
userRouter.get("/profile",authMiddleware.authMiddleware , userController.getProfile);
userRouter.post("/logout", userController.logout);
userRouter.get("/user-list",authMiddleware.authMiddleware, userController.getAllUsers);
export default userRouter;
