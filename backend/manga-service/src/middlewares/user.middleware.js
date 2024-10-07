import yup from 'yup';

import jwt from '../utils/jwt.util.js';
import { decrypt } from '../utils/password.util.js';
import { user_rules as rules } from '../utils/yup.util.js';

async function google_sign_up(req, res, next) {
    const { token, password } = req.body;

    let payload = null;
    console.log(token);
    try {
        payload = jwt.verifyJwt(token, 3);
    } catch (err) {
        console.log(err);
        return res.jsonUnauthorized(null, null, null);
    }

    const schema = yup.object().shape({
        email: rules.email,
        password: rules.password,
        name: rules.name,
        role: rules.role,
    });

    schema
        .validate(
            {
                email: payload.email,
                name: payload.name,
                password: password,
            },
            { stripUnknown: true },
        )
        .then(result => {
            req.body = result;
            next();
        })
        .catch(err => {
            console.log(err);
            return res.jsonBadRequest(null, null, err.errors);
        });
}

async function sign_up(req, res, next) {
    const yupObject = yup.object().shape({
        email: rules.email,
        password: rules.password,
        name: rules.name.required(),
        role: rules.role.required(),
    });

    yupObject
        .validate(req.body, { stripUnknown: true })
        .then((result) => {          
            req.body = result;            
            next();
        })
        .catch(err => {
            console.log(err);
            return res.jsonBadRequest(null, null, err.errors);
        });
}

async function sign_in(req, res, next) {
    const [hashType, hash] = req.headers.authorization
        ? req.headers.authorization.split(' ')
        : [''];

    if (hashType !== 'Basic') {
        return res.jsonUnauthorized(null, null, null);
    }

    const [email, password] = Buffer.from(hash, 'base64').toString().split(':');

    const yupObject = yup.object().shape({
        email: rules.email,
        password: rules.sign_in_password,
    });

    yupObject
        .validate({ email: email, password: password }, { stripUnknown: true })
        .then(result => {
            req.body = result;
            next();
        })
        .catch(err => {
            return res.jsonBadRequest(null, null, err.errors);
        });
}

async function findOne(req, res, next) {
    let schema = yup.object().shape({
        user_id: rules._id,
    });

    schema
        .validate(req.query, { stripUnknown: true })
        .then(result => {
            req.query = result;
            next();
        })
        .catch(err => {
            console.log(err);
            return res.jsonBadRequest(null, null, err.errors);
        });
}

async function list(req, res, next) {
    let schema = yup.object().shape({
        name: rules.name,
    });

    schema
        .validate(req.query, { stripUnknown: true })
        .then(result => {
            req.query = result;
            next();
        })
        .catch(err => {
            return res.jsonBadRequest(null, null, err.errors);
        });
}

async function update(req, res, next) {
    let schema = yup.object().shape({
        name: rules.name,
    });

    schema
        .validate(req.body, { stripUnknown: true })
        .then(result => {
            req.body = result;
            next();
        })
        .catch(err => {
            return res.jsonBadRequest(null, null, err.toString());
        });
}

async function remove(req, res, next) {
    let schema = yup.object().shape({
        user_id: rules._id,
    });

    schema
        .validate(req.query, { stripUnknown: true })
        .then(result => {
            if (decrypt(req.auth) !== user_id)
                return res.jsonBadRequest(null, null, null);
            req.query = result;
            next();
        })
        .catch(err => {
            return res.jsonBadRequest(null, null, err.errors);
        });
}

export default {
    google_sign_up,
    sign_up,
    sign_in,
    findOne,
    list,
    update,
    remove,
};
