import User from '../models/user.model.js';

import { TEST_E2E_ENV } from '../utils/constant.util.js';
import jwt from '../utils/jwt.util.js';
import { encrypt } from '../utils/password.util.js';

function auth(roles = []) {
    return async (req, res, next) => {
        const [, token] = req.headers.authorization
            ? req.headers.authorization.split(' ')
            : [, ''];
        roles = typeof roles === 'string' ? [roles] : roles;

        let payload = null;
        try {
            payload = jwt.verifyJwt(token, 1);
        } catch (err) {
            //Invalid Token
            return res.jsonUnauthorized(err, null, null);
        }
        //Invalid roles
        if (roles.length && !roles.includes(payload.role))
            return res.jsonUnauthorized(null, null, null);

        if (process.env.NODE_ENV === TEST_E2E_ENV) {
            req.auth = encrypt(payload._id);
            return next();
        }
        User.exists({
            _id: payload._id,
            active: true,
            token_version: payload.token_version,
        })
            .then(result => {
                if (!result) return res.jsonUnauthorized(null, null, null);

                try {
                    var current_time = Date.now().valueOf() / 1000;
                    if (
                        (payload.exp - payload.iat) / 2 >
                        payload.exp - current_time
                    ) {
                        let new_token = jwt.generateJwt(
                            {
                                id: payload._id,
                                role: payload.role,
                                token_version: payload.token_version,
                            },
                            1,
                        );
                        req.new_token = `Bearer ${new_token}`;
                        console.log(`New Token: ${new_token}`);
                    } else {
                        console.log('Token not expired');
                    }

                    req.auth = encrypt(payload._id);
                    payload = null;
                    return next();
                } catch (err) {
                    console.log(err);
                    //Server error
                    return res.jsonServerError(null, null, null);
                }
            })
            .catch(err => {
                return res.jsonUnauthorized(null, null, err);
            });
    };
}

function easyAuth() {
    return async (req, res, next) => {
        if (!req.headers.authorization) return next();

        const [, token] = req.headers.authorization.split(' ');
        if (!token) return next();

        let payload = null;
        const dict = {
            '': 0,
            Scan: 1,
            User: 2,
        };

        payload = jwt.verifyJwt(token, 1);
        if (process.env.NODE_ENV === TEST_E2E_ENV) {
            req.auth = encrypt(payload._id);
            req.role = encrypt(dict[payload.role].toString());
            payload = null;
            return next();
        }

        User.exists({
            _id: payload._id,
            active: true,
            token_version: payload.token_version,
        })
            .then(result => {
                if (!result) return next();

                try {
                    var current_time = Date.now().valueOf() / 1000;
                    console.log(payload);
                    console.log(payload.exp - payload.iat);
                    console.log(payload.exp - current_time);
                    console.log(current_time);
                    if (
                        (payload.exp - payload.iat) / 2 >
                        payload.exp - current_time
                    ) {
                        let new_token = jwt.generateJwt(
                            {
                                id: payload._id,
                                role: payload.role,
                                token_version: payload.token_version,
                            },
                            1,
                        );
                        req.new_token = `Bearer ${new_token}`;
                        console.log(`New Token: ${new_token}`);
                    } else {
                        console.log('Token not expired');
                    }

                    req.role = encrypt(dict[payload.role].toString());
                    payload = null;
                    return next();
                } catch (err) {
                    console.log('something went wrong.');
                    console.log(err);
                    return next();
                }
            })
            .catch(err => {
                return next();
            });
    };
}

export { auth, easyAuth };
