"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = __importDefault(require("../controller/user.controller"));
const validator_1 = __importDefault(require("../utils/validator"));
const auth_middleware_1 = __importDefault(require("../middleware/auth.middleware"));
let userRouter = express_1.default.Router();
userRouter.post("/sign-up", validator_1.default.signUpValidator, user_controller_1.default.signUp);
userRouter.post("/login", validator_1.default.loginValidator, user_controller_1.default.login);
userRouter.get("/profile", auth_middleware_1.default.authMiddleware, user_controller_1.default.getProfile);
userRouter.post("/logout", user_controller_1.default.logout);
userRouter.get("/user-list", auth_middleware_1.default.authMiddleware, user_controller_1.default.getAllUsers);
exports.default = userRouter;
