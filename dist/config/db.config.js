"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const user_entities_1 = require("../entities/user.entities");
const session_entities_1 = require("../entities/session.entities");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
let db = new typeorm_1.DataSource({
    type: process.env.DB_TYPE,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    logging: true,
    synchronize: true,
    entities: [user_entities_1.User, session_entities_1.Session],
});
exports.default = db;
