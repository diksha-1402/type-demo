import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from "dotenv";

dotenv.config();
class helperController {
    
    async hashPassword(password: string){
        const hashedPassword = await bcrypt.hash(password, 10);
        return hashedPassword;
    }

    async comparePassword(password: string, hashedPassword: string){
        return await bcrypt.compare(password, hashedPassword);
    }

    async generateToken(userData:any){
        const secretKey = process.env.JWT_TOKEN_KEY as string;
       
        const user = {
            id: userData.id,
            email: userData.email,
          };
        const token = jwt.sign(user, secretKey, { expiresIn: '1h' });
        return token;
    }
}

export default new helperController();  // Use default export for module
