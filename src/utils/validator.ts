import { NextFunction, Request, Response } from "express";
import { Validator } from "node-input-validator";
class NodeValidator {
  async signUpValidator(req: Request, res: Response, next: NextFunction) {
    const v = new Validator(req.body, {
      email: "required|email",
      lastName: "required|minLength:2",
      firstName: "required|minLength:2",
      password: "required|minLength:5",
      confirmPassword: "required|minLength:5|same:password",
    });

    v.check().then((matched) => {
      if (!matched) {
        const messages = Object.values(v.errors).map(
          (error: any) => error.message
        );
        return res.status(422).json({ status: 0, message: messages[0] });
      } else {
        next();
      }
    });
  }

  async loginValidator(req: Request, res: Response, next: NextFunction) {
    const v = new Validator(req.body, {
      email: "required|email",
      password: "required|minLength:5",
    });

    v.check().then((matched) => {
      if (!matched) {
        const messages = Object.values(v.errors).map(
          (error: any) => error.message
        );
        return res.status(422).json({ status: 0, message: messages[0] });
      } else {
        next();
      }
    });
  }
}
export default new NodeValidator();
