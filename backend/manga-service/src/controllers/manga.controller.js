import fs from 'fs';

import Author from '../models/author.model.js';
import Chapter from '../models/chapter.model.js';
import Manga from '../models/manga.model.js';
import User from '../models/user.model.js';

import { TEST_E2E_ENV, MANGA_PROJECTION } from '../utils/constant.util.js';
import { decrypt } from '../utils/password.util.js';
import { getMessage } from '../utils/message.util.js';

import { folderName } from '../config/multer.config.js';

async function store(req, res) {
    const {
        title,
        synopsis,
        writer_id,
        artist_id,
        type,
        genres,
        themes,
        n_chapters,
        status,
        languages,
        nsfw,
    } = req.body;

    const new_token = req.new_token ? req.new_token : null;
    req.new_token = null;

    let scan_id = decrypt(req.auth);

    const imgCollection = req.files.map(x => ({
        mimetype: x.mimetype,
        filename: x.filename,
        size: x.size,
    }));
    const deleteFiles = () => {
        Object.keys(req.files).forEach(i => {
            let file = req.files[i];
            fs.unlinkSync(
                folderName + 'mangas/' + title + '/covers/' + file.filename,
            );
        });
    };

    req.auth = null;
    const manga = new Manga({
        imgCollection: imgCollection,
        title: title,
        synopsis: synopsis,
        n_chapters: n_chapters,
        status: status,
        languages: languages,
        genres: genres,
        themes: themes,
        nsfw: nsfw,
        type: type,
        scan_id: scan_id,
        writer_id: writer_id,
        artist_id: artist_id,
        //comments?
    });
    if (process.env.NODE_ENV !== TEST_E2E_ENV) {
        const scan = await User.findById(scan_id);

        if (!scan) {
            deleteFiles();

            return res.jsonNotFound(
                null,
                getMessage('manga.error.scan_id'),
                null,
            );
        }

        const doesMangaExist = await Manga.exists({ title: title });

        if (doesMangaExist) {
            deleteFiles();
            return res.jsonBadRequest(
                null,
                getMessage('manga.error.duplicate'),
                new_token,
            );
        }

        const artist = await Author.findById(artist_id);

        if (!artist || !artist.types.includes('artist')) {
            deleteFiles();

            return res.jsonNotFound(
                null,
                getMessage('manga.error.artist'),
                null,
            );
        }

        const writer = await Author.findById(writer_id);

        if (!writer || !writer.types.includes('writer')) {
            deleteFiles();
            return res.jsonNotFound(
                null,
                getMessage('manga.error.writer'),
                null,
            );
        }

        manga
            .save()
            .then(result => {
                scan.mangas.push(manga._id);
                artist.works.push(manga._id);
                writer.works.push(manga._id);
                artist
                    .save()
                    .then(() => {})
                    .catch(err => {});
                writer
                    .save()
                    .then(() => {})
                    .catch(err => {});
                scan.save()
                    .then(() => {
                        return res.jsonOK(
                            result,
                            getMessage('manga.save.success'),
                            new_token,
                        );
                    })
                    .catch(err => {
                        console.log(err);
                        return res.jsonServerError(null, null, err);
                    });
            })
            .catch(err => {
                console.log(err);
                deleteFiles();
                return res.jsonServerError(null, null, err);
            });
    } else {
        manga
            .save()
            .then(result => {
                return res.jsonOK(
                    result,
                    getMessage('manga.save.success'),
                    new_token,
                );
            })
            .catch(err => {
                console.log(err);
                deleteFiles();
                return res.jsonServerError(null, null, err);
            });
    }
}

async function findOne(req, res) {
    const { title, _id } = req.query;
    const new_token = req.new_token ? req.new_token : null;
    req.new_token = null;

    let role = req.role ? parseInt(decrypt(req.role)) : 0;
    req.role = null;

    const manga = _id
        ? await Manga.findById(_id).select(MANGA_PROJECTION[role]).exec()
        : await Manga.findOne({
              title: title,
          })
              .select(MANGA_PROJECTION[role])
              .exec();

    if (manga)
        return res.jsonOK(
            manga,
            getMessage('manga.findone.success'),
            new_token,
        );
    else return res.jsonNotFound(null, getMessage('manga.notfound'), null);
}

async function list(req, res) {
    const { genre, scan_id, title, type, writer_id, artist_id, recent } =
        req.query;
    const new_token = req.new_token ? req.new_token : null;
    req.new_token = null;

    let role = req.role ? parseInt(decrypt(req.role)) : 0;
    req.role = null;

    let docs = [];
    if (recent) {
        const search = type ? { type: type } : {};
        (
            await Manga.find(search)
                .sort('updatedAt')
                .select({ imgCollection: 1, title: 1, updatedAt: 1 })
        ).forEach(function (doc) {
            let temp = {
                _id: doc._id,
                imgCollection: doc.imgCollection,
                title: doc.title,
                updatedAt: doc.updatedAt,
                chapters: [],
            };
            Chapter.find({ manga_id: doc._id })
                .sort('updatedAt')
                .select({ number: 1, _id: 0 })
                .then(chapters => {
                    if (chapters.length !== 0) {
                        chapters.forEach(function (chap) {
                            temp.chapters.push({ number: chap.number });
                        });
                    }
                })
                .catch(err => {
                    return res.jsonServerError(null, null, err);
                });
            docs.push(temp);
        });
    } else {
        const search = genre
            ? { genre: genre }
            : writer_id
            ? { writer_id: writer_id }
            : type
            ? { type: type }
            : artist_id
            ? { artist_id: artist_id }
            : title
            ? { title: { $regex: title, $options: 'i' } }
            : scan_id
            ? { scan_id: scan_id }
            : {};
        (
            await Manga.find(search)
                .sort('updatedAt')
                .select(MANGA_PROJECTION[role])
        ).forEach(function (doc) {
            docs.push(doc);
        });
    }

    if (docs.length === 0) {
        return res.jsonNotFound(
            docs,
            getMessage('manga.list.empty'),
            new_token,
        );
    } else {
        docs.forEach(function (doc) {
            doc.user = undefined;
        });
        return res.jsonOK(
            docs,
            getMessage('manga.list.success') + docs.length,
            new_token,
        );
    }
}

async function update(req, res) {
    const { writer_id, artist_id, _id } = req.body;
    const new_token = req.new_token ? req.new_token : null;
    req.new_token = null;

    let scan_id = decrypt(req.auth);

    const artist = artist_id ? await Author.findById(artist_id) : null;

    if (
        (!artist || !artist.types.includes('artist')) &&
        process.env.NODE_ENV !== TEST_E2E_ENV
    )
        return res.jsonBadRequest(null, getMessage('manga.error.artist'), null);

    const writer = writer_id ? await Author.findById(writer_id) : null;

    if (
        (!writer || !writer.types.includes('writer')) &&
        process.env.NODE_ENV !== TEST_E2E_ENV
    )
        return res.jsonBadRequest(null, getMessage('manga.error.writer'), null);

    Manga.findById(_id)
        .then(manga => {
            if (manga.scan_id.toString() !== scan_id.toString())
                return res.jsonUnauthorized(null, null, null);

            manga
                .updateOne(req.body)
                .then(result => {
                    [artist, writer].forEach((author, i) => {
                        if (author) {
                            const condition =
                                i === 0
                                    ? author._id !== manga.artist_id
                                    : author._id !== manga.writer_id;
                            if (condition) {
                                let cloneData = author.works.filter(function (
                                    work_id,
                                ) {
                                    return (
                                        _id.toString() !== work_id.toString()
                                    );
                                });
                                //update artist document
                                author.works = cloneData;
                                author
                                    .save()
                                    .then(answer => {})
                                    .catch(err => {
                                        console.log(err);
                                    });
                            }
                        }
                    });

                    if (req.body.title) {
                        const currPath = folderName + 'mangas/' + manga.title;
                        const newPath = folderName + 'mangas/' + req.body.title;

                        fs.rename(currPath, newPath, function (err) {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log(
                                    'Successfully renamed the directory.',
                                );
                            }
                        });
                    }

                    return res.jsonOK(
                        null,
                        getMessage('manga.update.success'),
                        new_token,
                    );
                })
                .catch(err => {
                    console.log(err);
                    return res.jsonServerError(null, null, err);
                });
        })
        .catch(err => {
            console.log(err);
            return res.jsonServerError(null, null, err);
        });
}

async function remove(req, res) {
    const { _id } = req.query;

    const manga = await Manga.findById(_id);

    const new_token = req.new_token ? req.new_token : null;
    req.new_token = null;

    const scan_id = decrypt(req.auth);
    req.auth = null;

    if (!manga)
        return res.jsonBadRequest(
            null,
            getMessage('manga.notfound'),
            new_token,
        );
    if (manga.scan_id.toString() !== scan_id)
        return res.jsonUnauthorized(null, null, null);

    const mangas = await Manga.deleteMany({ _id: _id });

    // update writer and artist documents
    if (mangas.n === 0)
        return res.jsonNotFound(
            mangas,
            getMessage('manga.notfound'),
            new_token,
        );

    if (!process.env.NODE_ENV === TEST_E2E_ENV) {
        const scan = await User.findById(scan_id);
        scan.mangas = scan.mangas.filter(function (_id) {
            return _id.toString() !== _id.toString();
        });

        scan.save(function (err) {
            // yet another err object to deal with
            if (err) {
                return res.jsonServerError(null, null, err);
            }
        });

        /*(await Chapter.find({_id: _id})).forEach(function (doc){
                    doc.imgCollection.forEach(function (page){                            
                        fs.unlinkSync('uploads/' + manga.title + "/"+ page.filename)  
                    })                      
                });
                */

        const writer = await Author.findById(manga.writer_id);

        writer.works = writer.works.filter(function (_id) {
            return _id.toString() !== _id.toString();
        });

        writer.save(function (err) {
            // yet another err object to deal with
            if (err) {
                return res.jsonServerError(null, null, err);
            }
        });

        const artist = await Author.findById(manga.artist_id);

        artist.works = artist.works.filter(function (_id) {
            return _id.toString() !== _id.toString();
        });

        artist.save(function (err) {
            // yet another err object to deal with
            if (err) {
                return res.jsonServerError(null, null, err);
            }
        });
    }

    const chapters = await Chapter.deleteMany({ manga_id: _id });

    let dir = folderName + 'mangas/' + manga.title;

    fs.rmdir(dir, { recursive: true }, err => {
        if (err) {
            console.log(err);
        }
    });

    fs.rmdirSync(dir, { recursive: true });

    return res.jsonOK(
        {
            'mangas affected': mangas.deletedCount,
            'chapters affected': chapters.deletedCount,
        },
        getMessage('manga.delete.success'),
        new_token,
    );
}

export default { store, findOne, list, update, remove };
