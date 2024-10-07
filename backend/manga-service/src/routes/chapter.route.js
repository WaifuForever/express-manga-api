import express from 'express';
import multer from 'multer';

import ChapterController from '../controllers/chapter.controller.js';

import ChapterMiddleware from '../middlewares/chapter.middleware.js';
import multerConfig from '../config/multer.config.js';

import {
    auth as Authorize,
    easyAuth,
} from '../middlewares/session.middleware.js';

const router = express.Router();

const upload = multer(multerConfig.chapters).array('imgCollection');

router.post(
    '/',
    Authorize('Scan'),
    upload,
    ChapterMiddleware.store,
    ChapterController.store,
);
router.get(
    '/',
    easyAuth(),
    ChapterMiddleware.list,
    ChapterController.list,
);
router.get(
    '/findOne',
    easyAuth(),
    ChapterMiddleware.findById,
    ChapterController.findOne,
);
router.put(
    '/',
    Authorize('Scan'),
    upload,
    ChapterMiddleware.update,
    ChapterController.update,
);
router.delete(
    '/',
    Authorize('Scan'),
    ChapterMiddleware.findById,
    ChapterController.remove,
);

export default router;
