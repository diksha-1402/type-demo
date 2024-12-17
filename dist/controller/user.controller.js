"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_entities_1 = require("../entities/user.entities");
const helper_1 = __importDefault(require("../utils/helper"));
const db_config_1 = __importDefault(require("../config/db.config"));
const session_entities_1 = require("../entities/session.entities");
class UserController {
    signUp(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { firstName, lastName, email, password } = req.body;
                let userRepository = db_config_1.default.getRepository(user_entities_1.User);
                let userData = yield userRepository.findOne({ where: { email: email } });
                if (userData) {
                    return res
                        .status(409)
                        .json({ status: 0, message: "Email already exists", data: {} });
                }
                const newUser = userRepository.create({
                    firstName,
                    lastName,
                    email,
                    password: yield helper_1.default.hashPassword(password),
                });
                yield userRepository.save(newUser);
                return res.status(201).json({
                    status: 1,
                    message: "User created successfully",
                    data: newUser,
                });
            }
            catch (error) {
                console.log(error);
                return res
                    .status(500)
                    .json({ status: 0, message: "Error creating user", data: {} });
            }
        });
    }
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = req.body;
                let userRepository = db_config_1.default.getRepository(user_entities_1.User);
                const sessionRepository = db_config_1.default.getRepository(session_entities_1.Session);
                let userData = yield userRepository.findOne({
                    where: { email: email },
                });
                if (!userData) {
                    return res
                        .status(400)
                        .json({ status: 0, message: "User not found", data: {} });
                }
                const isMatch = yield helper_1.default.comparePassword(password, userData.password);
                if (!isMatch) {
                    return res
                        .status(401)
                        .json({ status: 0, message: "Invalid password", data: {} });
                }
                const existingSession = yield sessionRepository.findOne({
                    where: { user: userData.id },
                });
                if (existingSession) {
                    yield sessionRepository.remove(existingSession);
                }
                // Generate JWT token and return it as response
                const token = yield helper_1.default.generateToken(userData);
                const newSession = new session_entities_1.Session();
                newSession.user = userData;
                newSession.sessionId = token;
                yield sessionRepository.save(newSession);
                res.cookie("sessionId", token, { httpOnly: true });
                return res.status(200).json({
                    status: 1,
                    message: "login successfully",
                    data: { userData, token },
                });
            }
            catch (error) {
                console.log(error);
                return res
                    .status(500)
                    .json({ status: 0, message: "Something Went Wrong" });
            }
        });
    }
    logout(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const sessionId = req.cookies["sessionId"];
                if (!sessionId) {
                    return res.status(400).json({ status: 0, message: "No session found" });
                }
                const sessionRepository = db_config_1.default.getRepository(session_entities_1.Session);
                const session = yield sessionRepository.findOne({
                    where: { sessionId: sessionId },
                });
                if (!session) {
                    return res.status(400).json({ status: 0, message: "Invalid session" });
                }
                yield sessionRepository.remove(session);
                res.clearCookie("sessionId");
                res.status(200).json({ status: 1, message: "Logout successful" });
            }
            catch (error) {
                console.error(error);
                res.status(500).json({ status: 0, message: "Server error" });
            }
        });
    }
    getProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let userId = req.body.user.id;
                let userRepository = db_config_1.default.getRepository(user_entities_1.User);
                let userData = yield userRepository.findOne({ where: { id: userId } });
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
            }
            catch (error) {
                console.log(error);
                return res
                    .status(500)
                    .json({ status: 0, message: "Error creating user", data: {} });
            }
        });
    }
    getAllUsers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 10;
                const offset = (page - 1) * limit;
                let userRepository = db_config_1.default.getRepository(user_entities_1.User);
                // Find users with pagination
                let [userData, totalCount] = yield userRepository.findAndCount({
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
            }
            catch (error) {
                return res
                    .status(500)
                    .json({ status: 0, message: "Error fetching users", data: {} });
            }
        });
    }
}
exports.default = new UserController();
