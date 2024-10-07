import Manga from '../models/manga.model.js';
import User from '../models/user.model.js';

import { decrypt } from '../utils/password.util.js';
import { getMessage } from '../utils/message.util.js';

async function likeUser(req, res) {
    const { scan_id } = req.query;
    const new_token = req.new_token ? req.new_token : null;
    req.new_token = null;

    const current_user = decrypt(req.auth);
    req.auth = null;

    const scan = await User.findById(scan_id);

    if (!scan) {
        return res.jsonNotFound(null, getMessage('user.notfound'), new_token);
    }

    if (scan.role === 'User') {
        return res.jsonBadRequest(null, null, new_token);
    }

    scan.likes.includes(current_user)
        ? (scan.likes = scan.likes.filter(function (_id) {
              return _id.toString() !== current_user.toString();
          }))
        : scan.likes.push(current_user);

    scan.updatedAt = Date.now();

    let changes = scan.getChanges();

    scan.save()
        .then(() => {
            User.findById(current_user)
                .then(user => {
                    user.likes.includes(scan_id)
                        ? (user.likes = user.likes.filter(function (_id) {
                              return _id.toString() !== scan_id.toString();
                          }))
                        : user.likes.push(scan_id);

                    user.save()
                        .then(answer => {
                            console.log(answer);
                            return res.jsonOK(
                                changes,
                                getMessage('user.like.success'),
                                new_token,
                            );
                        })
                        .catch(err => {
                            console.log(err);
                            return res.jsonServerError(
                                null,
                                null,
                                err.toString(),
                            );
                        });
                })
                .catch(err => {
                    console.log(err);
                    return res.jsonServerError(null, null, err.toString());
                });
        })
        .catch(err => {
            console.log(err);
            return res.jsonServerError(null, null, err.toString());
        });
}

async function likeManga(req, res) {
    const { manga_id } = req.query;

    const new_token = req.new_token ? req.new_token : null;
    req.new_token = null;

    const current_user = decrypt(req.auth);
    req.auth = null;

    const manga = await Manga.findById(manga_id);

    if (!manga) {
        return res.jsonNotFound(null, getMessage('manga.notfound'), new_token);
    }

    const user = await User.findById(current_user);

    if (!user) {
        return res.jsonNotFound(null, getMessage('user.notfound'), new_token);
    }

    manga.likes.includes(current_user)
        ? (manga.likes = manga.likes.filter(function (_id) {
              return _id.toString() !== current_user.toString();
          }))
        : manga.likes.push(current_user);

    manga.updatedAt = Date.now();

    user.mangas.includes(manga_id)
        ? (user.mangas = user.mangas.filter(function (_id) {
              return _id.toString() !== manga_id.toString();
          }))
        : user.mangas.push(manga_id);

    let changes = user.getChanges();

    manga
        .save()
        .then(() => {
            user.save()
                .then(() => {
                    return res.jsonOK(
                        changes,
                        getMessage('manga.like.success'),
                        new_token,
                    );
                })
                .catch(err => {
                    console.log(err);
                    return res.jsonServerError(null, null, err.toString());
                });
        })
        .catch(err => {
            console.log(err);
            return res.jsonServerError(null, null, err.toString());
        });
}

async function pinManga(req, res) {
    const { manga_id } = req.query;

    const new_token = req.new_token ? req.new_token : null;
    req.new_token = null;

    const current_user = decrypt(req.auth);
    req.auth = null;

    const manga = await Manga.findById(manga_id);

    if (!manga) {
        return res.jsonNotFound(null, getMessage('manga.notfound'), new_token);
    }

    const user = await User.findById(current_user);

    if (!user) {
        return res.jsonNotFound(null, getMessage('user.notfound'), new_token);
    }

    manga.user_alert.includes(current_user)
        ? (manga.user_alert = manga.user_alert.filter(function (_id) {
              return _id.toString() !== current_user.toString();
          }))
        : manga.user_alert.push(current_user);

    manga.updatedAt = Date.now();

    user.manga_alert.includes(manga_id)
        ? (user.manga_alert = user.manga_alert.filter(function (_id) {
              return _id.toString() !== manga_id.toString();
          }))
        : user.manga_alert.push(manga_id);

    let changes = user.getChanges();

    manga
        .save()
        .then(() => {
            user.save()
                .then(() => {
                    return res.jsonOK(
                        changes,
                        getMessage('manga.pin.success'),
                        new_token,
                    );
                })
                .catch(err => {
                    console.log(err);
                    return res.jsonServerError(null, null, err.toString());
                });
        })
        .catch(err => {
            console.log(err);
            return res.jsonServerError(null, null, err.toString());
        });
}

export default { likeUser, likeManga, pinManga };
