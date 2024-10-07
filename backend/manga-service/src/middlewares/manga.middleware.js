import yup from 'yup';

import { manga_rules as rules } from '../utils/yup.util.js';

async function store(req, res, next) {
    let schema = yup.object().shape({
        title: rules.title.required(),
        genres: rules.genres.required(),
        themes: rules.themes.required(),

        writer_id: rules.writer_id.required(),
        artist_id: rules.artist_id.required(),
        synopsis: rules.synopsis.required(),
        n_chapters: rules.n_chapters.required(),
        status: rules.status.required(),
        nsfw: rules.nsfw.required(),
        type: rules.type.required(),
        languages: rules.languages.required(),
    });

    schema
        .validate(req.body, { stripUnknown: true })
        .then(result => {
            if (req.files) {
                req.body = result;
                req.nsfw = req.nsfw === 'true';
                next();
            } else {
                return res.jsonBadRequest(null, null, null);
            }
        })
        .catch(function (e) {
            console.log(e);
            return res.jsonBadRequest(null, null, e.path + ' : ' + e.message);
        });
}

async function findOne(req, res, next) {
    let schema = yup
        .object()
        .shape({
            title: rules.title,
            _id: rules.id_not_required,
        })
        .test(
            'at-least-one-field',
            'you must provide at least one field',
            value => (value.title && !value._id) || (!value.title && value._id),
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

async function list(req, res, next) {
    let schema = yup.object().shape({
        title: rules.title,
        genre: rules.genre,
        scan_id: rules.mongo_id,
        recent: yup.boolean(),
    });

    schema
        .validate(req.query, { stripUnknown: true })
        .then(result => {
            req.query = result;
            next();
        })
        .catch(e => {
            return res.jsonBadRequest(null, null, e.path + ' : ' + e.message);
        });
}

async function update(req, res, next) {
    var obj = {};
    Object.keys(req.body).forEach(function (value) {
        obj[value] = rules[value];
    });
    obj.artist_id = rules.id_not_required;
    obj.writer_id = rules.id_not_required;

    let schema = yup
        .object()
        .shape(obj)
        .test(
            'at-least-one-field',
            'you must provide at least one field',
            value =>
                !!(
                    value.title ||
                    value.genres ||
                    value.themes ||
                    value.writer_id ||
                    value.artist_id ||
                    value.synopsis ||
                    value.n_chapters ||
                    value.status ||
                    value.n_chapters ||
                    value.status ||
                    value.nsfw ||
                    value.type ||
                    value.languages ||
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

async function remove(req, res, next) {
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
            console.log(err);
            return res.jsonBadRequest(null, null, err.errors);
        });
}

export default {
    store,
    findOne,
    list,
    update,
    remove,
};
