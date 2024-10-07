import yup from 'yup';

import { chapter_rules as rules } from '../utils/yup.util.js';

async function store(req, res, next) {
    let schema = yup.object().shape({
        manga_id: rules.manga_id.required(),
        title: rules.title.required(),
        number: rules.number.required(),
        language: rules.language.required(),
    });

    schema
        .validate(req.body, { stripUnknown: true })
        .then(result => {
            if (req.files.length) {
                req.body = result;
                next();
            } else return res.jsonBadRequest(null, null, null);
        })
        .catch(function (e) {
            console.log(e);
            return res.jsonBadRequest(null, null, e);
        });
}

async function findById(req, res, next) {
    let schema = yup.object().shape({
        _id: rules._id.required(),
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
    let schema = yup
        .object()
        .shape({
            manga_id: rules.id_not_required,
            manga_title: rules.manga_id,
        })
        .test(
            'at-least-one-field',
            'you must provide at least one field',
            value =>
                (value.manga_title && !value.manga_id) ||
                (!value.manga_title && value.manga_id),
        );
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

async function update(req, res, next) {
    let schema = yup.object().shape({
        chapter_title: rules.chapter_title,
        number: rules.number,
        _id: rules._id.required(),
        language: rules.language,
    });

    schema
        .validate(req.body)
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
