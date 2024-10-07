import path from 'path';
import multer from 'multer';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { randomBytes } from 'crypto';

import { decrypt } from '../utils/password.util.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const limits = () => {
    fileSize: 3 * 1024 * 1024;
};

const fileFilter = (req, file, cb) => {
    const allowedMimes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        var message = `${file.originalname} is invalid. Only accept png/jpeg/jpg.`;
        cb(new Error(message));
    }
};

const fileName = (req, file, cb) => {
    randomBytes(16, (err, hash) => {
        if (err) cb(err);
        cb(null, `${hash.toString('hex')}-${file.originalname}`);
    });
};

const authorDestination = (req, files, cb) => {
    cb(
        null,
        path.resolve(
            __dirname,
            '..',
            '..',
            folderName,
            'authors/',
            req.body.name,
        ),
    );

    let dir = './' + folderName + 'authors/';

    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    if (!fs.existsSync(dir + req.body.name)) fs.mkdirSync(dir + req.body.name);
};

const chaptersDestination = (req, files, cb) => {
    let user_id = decrypt(req.auth);
    cb(
        null,
        path.resolve(
            __dirname,
            '..',
            '..',
            folderName,
            'mangas/',
            req.body.manga_id + '/',
            req.body.number + '/',
            req.body.language + '/',
            user_id,
        ),
    );
    
    let dir =
        './' +
        folderName +
        'mangas/' +
        req.body.manga_id +
        '/' +
        req.body.number +
        '/' +
        req.body.language +
        '/';

    if (!fs.existsSync(dir + user_id))
        fs.mkdirSync(dir + user_id, { recursive: true });
};

const coversDestination = (req, files, cb) => {
    cb(
        null,
        path.resolve(
            __dirname,
            '..',
            '..',
            folderName,
            'mangas/',
            req.body.title + '/covers',
        ),
    );

    let dir = './' + folderName + 'mangas/' + req.body.title;

    if (!fs.existsSync(dir))
        fs.mkdirSync(dir + '/covers/', { recursive: true });
};

const multerConfig = destination => {
    return {
        storage: multer.diskStorage({
            destination: destination,
            filename: fileName,
        }),
        limits: limits,
        fileFilter: fileFilter,
    };
};

export const folderName =
    process.env.NODE_ENV === 'dev' ? 'uploads/' : 'uploads2/';

export default {
    authorFiles: multerConfig(authorDestination),
    covers: multerConfig(coversDestination),
    chapters: multerConfig(chaptersDestination),
};
