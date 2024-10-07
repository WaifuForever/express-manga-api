import * as bcrypt from 'bcrypt';
import { createCipheriv, createDecipheriv } from 'crypto';

export const hashPassword = async (password, salt) => {
    return await bcrypt.hash(
        password,
        salt ? salt : bcrypt.genSaltSync(parseInt(`${process.env.BCRYPT_SALT}`)),
    );
};

export const matchPassword = async (
    password,
    supposedPassword,
) => {
    return await bcrypt.compare(password, supposedPassword);
};

export const encrypt = (val) => {    
    let cipher = createCipheriv(
        `${process.env.ALGORITHM}`,
        Buffer.from(`${process.env.ENC_KEY}`, "hex"),
        Buffer.from(`${process.env.IV}`, "hex")
    );
    let encrypted = cipher.update(val, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return encrypted;
};

export const decrypt = (encrypted) => {
    let decipher = createDecipheriv(
        `${process.env.ALGORITHM}`,
        Buffer.from(`${process.env.ENC_KEY}`, "hex"),
        Buffer.from(`${process.env.IV}`, "hex")
    );
    let decrypted = decipher.update(encrypted, 'base64', 'utf8');
    return decrypted + decipher.final('utf8');
};