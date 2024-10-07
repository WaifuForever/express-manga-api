import yup from 'yup';

import { author_rules as rules } from '../utils/yup.util.js';

async function store(req, res, next) {
    let currentDate = new Date();
    currentDate.setFullYear(currentDate.getFullYear() - 10);

    const schema = yup.object().shape({
        types: rules.types.required(),
        name: rules.name.required(),
        birthDate: rules.birthDate.required(),
        deathDate: rules.deathDate,
        socialMedia: rules.socialMedia.required(),
        biography: rules.biography.required(),
    });

    schema
        .validate(req.body, { stripUnknown: true })
        .then(result => {
            req.body = result;
            next();
        })
        .catch(function (e) {
            console.log(e);
            return res.jsonBadRequest(null, null, e);
        });
}

async function findById(req, res, next) {
    let schema = yup.object().shape({
        _id: rules._id,
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

async function list(req, res, next) {
    let schema = yup.object().shape({
        types: rules.type,
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
    let currentDate = new Date();
    currentDate.setFullYear(currentDate.getFullYear() - 10);
    var obj = {};
    Object.keys(req.body).forEach(function (value) {
        obj[value] = rules[value];
    });

    const schema = yup
        .object()
        .shape(obj)
        .test(
            'at-least-one-field',
            'you must provide at least one field',
            value =>
                !!(
                    value.types ||
                    value.name ||
                    value.birthDate ||
                    value.deathDate ||
                    value.socialMedia ||
                    value.biography ||
                    req.files.length
                ),
        );

    schema
        .validate(req.body, { stripUnknown: true })
        .then(result => {
            req.body = result;
            next();
        })
        .catch(err => {
            return res.jsonBadRequest(null, null, err.errors);
        });
}

export default {
    store,
    findById,
    list,
    update,
};
