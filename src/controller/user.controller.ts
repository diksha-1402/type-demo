import { Request, Response } from "express";
import { IUser, User } from "../entities/user.entities";
import helperController from "../utils/helper";
import db from "../config/db.config";
import { Session } from "../entities/session.entities";
class UserController {
  async signUp(req: Request, res: Response): Promise<any> {
    try {
      const { firstName, lastName, email, password } = req.body;
      let userRepository = db.getRepository(User);
      let userData = await userRepository.findOne({ where: { email: email } });

      if (userData) {
        return res
          .status(409)
          .json({ status: 0, message: "Email already exists", data: {} });
      }

      // Logic for saving a new user
      const newUser = userRepository.create({
        firstName,
        lastName,
        email,
        password: await helperController.hashPassword(password),
      });

      await userRepository.save(newUser);

      return res.status(201).json({
        status: 1,
        message: "User created successfully",
        data: newUser,
      });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ status: 0, message: "Error creating user", data: {} });
    }
  }

  async login(req: Request, res: Response): Promise<any> {
    try {
      const { email, password } = req.body;
      let userRepository = db.getRepository(User);
      const sessionRepository = db.getRepository(Session);
      let userData: any = await userRepository.findOne({
        where: { email: email },
      });
      if (!userData) {
        return res
          .status(400)
          .json({ status: 0, message: "User not found", data: {} });
      }

      const isMatch = await helperController.comparePassword(
        password,
        userData.password
      );

      if (!isMatch) {
        return res
          .status(401)
          .json({ status: 0, message: "Invalid password", data: {} });
      }
      const existingSession = await sessionRepository.findOne({
        where: { user: userData.id },
      });
      if (existingSession) {
        await sessionRepository.remove(existingSession);
      }
      // Generate JWT token and return it as response
      const token = await helperController.generateToken(userData);
      const newSession = new Session();
      newSession.user = userData;
      newSession.sessionId = token;

      await sessionRepository.save(newSession);
      res.cookie("sessionId", token, { httpOnly: true });
      return res.status(200).json({
        status: 1,
        message: "login successfully",
        data: { userData, token },
      });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ status: 0, message: "Something Went Wrong" });
    }
  }

  async logout(req: Request, res: Response): Promise<any> {
    try {
      const sessionId = req.cookies["sessionId"];

      if (!sessionId) {
        return res.status(400).json({ status: 0, message: "No session found" });
      }

      const sessionRepository = db.getRepository(Session);
      const session = await sessionRepository.findOne({
        where: { sessionId: sessionId },
      });

      if (!session) {
        return res.status(400).json({ status: 0, message: "Invalid session" });
      }

      await sessionRepository.remove(session);
      res.clearCookie("sessionId");

      res.status(200).json({ status: 1, message: "Logout successful" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ status: 0, message: "Server error" });
    }
  }

  async getProfile(req: Request, res: Response): Promise<any> {
    try {
      let userId = req.body.user.id;
      let userRepository = db.getRepository(User);
      let userData = await userRepository.findOne({ where: { id: userId } });

      if (!userData) {
        return res
          .status(409)
          .json({ status: 0, message: "user not found", data: {} });
      }

      return res.status(201).json({
        status: 1,
        message: "UserData",
        data: userData,
      });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ status: 0, message: "Error creating user", data: {} });
    }
  }

  async getAllUsers(req: Request, res: Response): Promise<any> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;
      let userRepository = db.getRepository(User);
      // Find users with pagination
      let [userData, totalCount] = await userRepository.findAndCount({
        where: { status: 0 },
        skip: offset,
        take: limit,
      });

      if (userData.length === 0) {
        return res
          .status(409)
          .json({ status: 0, message: "User not found", data: {} });
      }

      return res.status(200).json({
        status: 1,
        message: "UserData",
        data: userData,
        totalCount: totalCount,
      });
    } catch (error) {
      return res
        .status(500)
        .json({ status: 0, message: "Error fetching users", data: {} });
    }
  }
}

export default new UserController();
