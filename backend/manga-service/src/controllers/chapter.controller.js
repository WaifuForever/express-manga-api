import fs from 'fs';

import Chapter from '../models/chapter.model.js';
import Manga from '../models/manga.model.js';

import { TEST_E2E_ENV, CHAPTER_PROJECTION } from '../utils/constant.util.js';
import { decrypt } from '../utils/password.util.js';
import { getMessage } from '../utils/message.util.js';
import { folderName } from '../config/multer.config.js';

const dir = folderName + 'mangas/';

async function store(req, res) {
    const { manga_id, number, title, language } = req.body;

    const new_token = req.new_token ? req.new_token : null;
    req.new_token = null;

    Manga.findOne({ title: manga_id }, (err, manga) => {
        if (manga) {
            const filesPath =
                dir +
                manga_id +
                '/' +
                number +
                '/' +
                language +
                '/' +
                manga.scan_id +
                '/';

            Chapter.exists({
                manga_id: manga._id,
                number: number,
                language: language,
            }).then(exists => {
                if (exists) {
                    Object.keys(req.files).forEach(i => {
                        fs.unlinkSync(filesPath + req.files[i].filename);
                    });
                    return res.jsonBadRequest(
                        null,
                        getMessage('chapter.error.duplicate'),
                        new_token,
                    );
                } else {
                    let jsonString = [];

                    Object.keys(req.files).forEach(i => {
                        let file = req.files[i];

                        let temp = {
                            originalname: file.originalname,
                            size: file.size,
                            filename: file.filename,
                        };

                        jsonString.push(JSON.parse(JSON.stringify(temp)));
                    });

                    const chapter = new Chapter({
                        manga_id: manga_id,
                        number: number,
                        title: title,
                        language: language,
                        imgCollection: [],
                    });

                    chapter.imgCollection = jsonString;

                    chapter
                        .save()
                        .then(result => {
                            manga.chapters.push(result._id);
                            manga
                                .save()
                                .then(answer => {
                                    return res.jsonOK(
                                        result,
                                        getMessage('chapter.save.success'),
                                        new_token,
                                    );
                                })
                                .catch(err => {
                                    Chapter.deleteOne({ _id: result._id });
                                    Object.keys(req.files).forEach(i => {
                                        fs.unlinkSync(
                                            filesPath + req.files[i].filename,
                                        );
                                    });
                                    console.log(err);

                                    return res.jsonServerError(null, null, err);
                                });
                        })
                        .catch(err => {
                            Object.keys(req.files).forEach(i => {
                                fs.unlinkSync(
                                    filesPath + req.files[i].filename,
                                );
                            });
                            console.log(err);
                            return res.jsonServerError(null, null, err);
                        });
                }
            });
        } else {
            let dir2 = dir + manga_id;

            fs.rmdir(dir2, { recursive: true }, e => {
                if (e) console.log(e);
            });

            return res.jsonNotFound(
                null,
                getMessage('manga.notfound'),
                new_token,
            );
        }
    });
}

async function update(req, res) {
    const { _id } = req.body;
    const new_token = req.new_token ? req.new_token : null;
    req.new_token = null;

    let manga = await Manga.findById(chapter.manga_id);
    if (!manga) {
        return res.jsonNotFound(null, getMessage('manga.notfound'), new_token);
    }

    if (manga.scan_id.toString() === decrypt(req.auth)) {
        manga = null;

        Chapter.findOneAndUpdate(
            req.body,
            { $set: { _id: _id } },
            function (err, doc) {
                if (err) {
                    return res.jsonNotFound(
                        err,
                        getMessage('chapter.notfound'),
                        new_token,
                    );
                } else {
                    return res.jsonOK(
                        req.body,
                        getMessage('chapter.update.success'),
                        new_token,
                    );
                }
            },
        );
    } else {
        return res.jsonUnauthorized(null, null, null);
    }
}

async function findOne(req, res) {
    const { _id } = req.query;
    const new_token = req.new_token ? req.new_token : null;
    req.new_token = null;

    const role = req.role ? decrypt(req.role) : 0;
    req.role = null;

    Chapter.findById(_id)
        .select(CHAPTER_PROJECTION[role])
        .then(doc => {
            if (!doc)
                return res.jsonNotFound(
                    null,
                    getMessage('chapter.notfound'),
                    null,
                );
            doc.views = doc.views + 1;
            doc.save()
                .then(() => {})
                .catch(err => {
                    console.log(err);
                })
                .finally(() => {
                    return res.jsonOK(
                        doc,
                        getMessage('chapter.findone.success'),
                        new_token,
                    );
                });
        })
        .catch(err => {
            console.log(err);
            return res.jsonBadRequest(err, null, null);
        });
}

async function list(req, res) {
    const { manga_id, manga_title } = req.query;
    const new_token = req.new_token ? req.new_token : null;
    req.new_token = null;

    let role = req.role ? decrypt(req.role) : 0;
    req.role = null;

    let docs = [];

    const doesMangaExist = manga_id
        ? await Manga.exists({ _id: manga_id })
        : await Manga.exists({ title: manga_title });
    if (!doesMangaExist) {
        return res.jsonNotFound(null, getMessage('manga.notfound'), null);
    }
    Chapter.find({
        manga_id: manga_id ? manga_id : manga_title ? manga_title : null,
    })
        .sort('updatedAt')
        .select(CHAPTER_PROJECTION[role])
        .then(result => {
            result.forEach(doc => {
                docs.push(doc);
            });
            if (docs.length === 0) {
                return res.jsonNotFound(
                    docs,
                    getMessage('chapter.list.empty'),
                    new_token,
                );
            } else {
                return res.jsonOK(
                    docs,
                    getMessage('chapter.list.success') + docs.length,
                    new_token,
                );
            }
        })
        .catch(err => {
            return res.jsonBadRequest(err, null, null);
        });
}

async function remove(req, res) {
    const { _id } = req.query;
    const new_token = req.new_token ? req.new_token : null;
    req.new_token = null;
    const chapter = await Chapter.findById(_id);

    if (!chapter)
        return res.jsonBadRequest(
            null,
            getMessage('chapter.notfound'),
            new_token,
        );

    let cloneData = [];
    //get the deleted chapter read in order to exclude it from chapters array inside manga object
    Manga.findOne({ title: chapter.manga_id }, function (err, manga) {
        if (!manga) {
            return res.jsonNotFound(
                { removed: false },
                getMessage('manga.notfound'),
                new_token,
            );
        }
        cloneData = manga.chapters.filter(function (chap_id) {
            return chap_id.toString() !== _id.toString();
        });
        const filesPath =
            dir +
            chapter.manga_id +
            '/' +
            chapter.number +
            '/' +
            chapter.language +
            '/' +
            manga.scan_id +
            '/';
        Chapter.deleteMany({ manga_id: chapter.manga_id, _id: _id })
            .then(result => {
                if (result.n === 0) {
                    //chapter could not be found
                    return res.jsonNotFound(
                        null,
                        getMessage('chapter.notfound'),
                        new_token,
                    );
                }
                manga.chapters = cloneData;
                manga
                    .save()
                    .then(result2 => {
                        try {
                            chapter.imgCollection.forEach(function (file) {
                                fs.unlinkSync(filesPath + file.filename);
                            });
                        } catch (err) {
                            return res.jsonServerError(
                                null,
                                getMessage('chapter.delete.error'),
                                null,
                            );
                        }

                        return res.jsonOK(
                            result,
                            getMessage('chapter.delete.success'),
                            new_token,
                        );
                    })
                    .catch(err => {
                        console.log(err);
                        return res.jsonServerError(null, null, err);
                    });
            })
            .catch(err => {
                return res.jsonBadRequest(err, null, null);
            });
    });
}
export default { store, findOne, list, update, remove };
