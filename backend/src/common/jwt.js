require('dotenv').config();
const jwt = require("jsonwebtoken");

const tokenPrivateKey = `${process.env.JWT_ID}`;
const refreshTokenPrivateKey =  `${process.env.JWT_REFRESH_ID}`;

const accActivatePrivateKey = `${process.env.JWT_ACTIVATE_ACCESS}`;
const recoverPassPrivateKey = `${process.env.JWT_RECOVER_ACCESS}`;
const updateEmailPrivateKey = `${process.env.JWT_UPDATE_ACCESS}`;

const options = { expiresIn: '120 minutes' };
const refreshOptions = { expiresIn: '12 hours' };


module.exports = {
    generateJwt(payload, num) {
        switch (num){
            case 1:
                return jwt.sign(payload, tokenPrivateKey, options);
            case 2:
                return jwt.sign(payload, refreshTokenPrivateKey, refreshOptions);
            case 3:
                return jwt.sign(payload, accActivatePrivateKey, options);
            case 4:
                return jwt.sign(payload, recoverPassPrivateKey, options);
            case 5:
                return jwt.sign(payload, updateEmailPrivateKey, options);

            default:
                return null;
        }
        
     
    },
    
    verifyJwt (token, num)  {
        switch (num){
            case 1:
                return jwt.verify(token, tokenPrivateKey);
            case 2:
                return jwt.verify(token, refreshTokenPrivateKey);
            case 3:
                return jwt.verify(token, accActivatePrivateKey);
            case 4:
                return jwt.verify(token, recoverPassPrivateKey);
            case 5:
                return jwt.verify(token, updatePasswordPrivateKey);

            default:
                return null;
        }
       
    },
    
}