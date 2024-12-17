import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
import { User } from "../entities/user.entities";
import db from "../config/db.config";

dotenv.config();

class AuthMiddleware {
  async authMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const authHeader = req.headers["authorization"];
      if (!authHeader) {
        return res
          .status(401)
          .send({ status: 0, message: "Token not provided" });
      }
      const parts = authHeader.split(" ");
      if (parts.length !== 2 || parts[0] !== "Bearer") {
        return res
          .status(400)
          .send({ status: 0, message: "Invalid token format" });
      }
      const token = parts[1];
      const secretKey = process.env.JWT_TOKEN_KEY as string;
      if (!secretKey) {
        return res
          .status(500)
          .send({ status: 0, message: "JWT secret key is not set" });
      }
      const decodeToken = jwt.verify(token, secretKey) as JwtPayload;
      const currentTimestamp = Math.floor(Date.now() / 1000);
      if (decodeToken.exp && decodeToken.exp < currentTimestamp) {
        return res.status(401).send({ status: 0, message: "Token expired" });
      }
      const userRepository = db.getRepository(User);
      const user = await userRepository.findOneBy({ id: decodeToken.id });
    
      if (!user) {
        return res.status(401).send({ status: 0, message: "User not found" });
      }
      if (user.sessions[0].sessionId != token) {
        return res.status(401).send({ status: 0, message: "Session Expired" });
      }
      req.body.user = user;
      next();
    } catch (error) {
      return res
        .status(500)
        .send({ status: 0, message: "Internal Server Error" });
    }
  }
}

export default new AuthMiddleware();
