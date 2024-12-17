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
Object.defineProperty(exports, "__esModule", { value: true });
const node_input_validator_1 = require("node-input-validator");
class NodeValidator {
    signUpValidator(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const v = new node_input_validator_1.Validator(req.body, {
                email: "required|email",
                lastName: "required|minLength:2",
                firstName: "required|minLength:2",
                password: "required|minLength:5",
                confirmPassword: "required|minLength:5|same:password",
            });
            v.check().then((matched) => {
                if (!matched) {
                    const messages = Object.values(v.errors).map((error) => error.message);
                    return res.status(422).json({ status: 0, message: messages[0] });
                }
                else {
                    next();
                }
            });
        });
    }
    loginValidator(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const v = new node_input_validator_1.Validator(req.body, {
                email: "required|email",
                password: "required|minLength:5",
            });
            v.check().then((matched) => {
                if (!matched) {
                    const messages = Object.values(v.errors).map((error) => error.message);
                    return res.status(422).json({ status: 0, message: messages[0] });
                }
                else {
                    next();
                }
            });
        });
    }
}
exports.default = new NodeValidator();
