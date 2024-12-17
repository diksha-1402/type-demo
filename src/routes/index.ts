import express from 'express';
import userRouter from './user.route';
let router = express.Router();

router.use("/auth",userRouter)

export default router;