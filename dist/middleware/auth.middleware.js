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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const user_entities_1 = require("../entities/user.entities");
const db_config_1 = __importDefault(require("../config/db.config"));
dotenv_1.default.config();
class AuthMiddleware {
    authMiddleware(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
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
                const secretKey = process.env.JWT_TOKEN_KEY;
                if (!secretKey) {
                    return res
                        .status(500)
                        .send({ status: 0, message: "JWT secret key is not set" });
                }
                const decodeToken = jsonwebtoken_1.default.verify(token, secretKey);
                const currentTimestamp = Math.floor(Date.now() / 1000);
                if (decodeToken.exp && decodeToken.exp < currentTimestamp) {
                    return res.status(401).send({ status: 0, message: "Token expired" });
                }
                const userRepository = db_config_1.default.getRepository(user_entities_1.User);
                const user = yield userRepository.findOneBy({ id: decodeToken.id });
                console.log(user);
                if (!user) {
                    return res.status(401).send({ status: 0, message: "User not found" });
                }
                if (user.sessions[0].sessionId != token) {
                    return res.status(401).send({ status: 0, message: "Session Expired" });
                }
                req.body.user = user;
                next();
            }
            catch (error) {
                return res
                    .status(500)
                    .send({ status: 0, message: "Internal Server Error" });
            }
        });
    }
}
exports.default = new AuthMiddleware();
