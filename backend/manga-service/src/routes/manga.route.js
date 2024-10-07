import express from 'express';
import multer from 'multer';

import LikeController from '../controllers/like.controller.js';
import MangaController from '../controllers/manga.controller.js';

import MangaMiddleware from '../middlewares/manga.middleware.js';
import multerConfig from '../config/multer.config.js';

import {
    auth as Authorize,
    easyAuth,
} from '../middlewares/session.middleware.js';

const upload = multer(multerConfig.covers).array('imgCollection');

const router = express.Router();

router.post(
    '/',
    Authorize('Scan'),
    upload,
    MangaMiddleware.store,
    MangaController.store,
);
router.get('/', easyAuth(), MangaMiddleware.list, MangaController.list);
router.get(
    '/findOne',
    easyAuth(),
    MangaMiddleware.findOne,
    MangaController.findOne,
);
router.put(
    '/',
    Authorize('Scan'),
    upload,
    MangaMiddleware.update,
    MangaController.update,
);
router.delete(
    '/',
    Authorize('Scan'),
    MangaMiddleware.remove,
    MangaController.remove,
);
router.put('/like', Authorize('User'), LikeController.likeManga);
router.put('/pin', Authorize('User'), LikeController.pinManga);

export default router;
