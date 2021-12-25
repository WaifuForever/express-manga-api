import express from 'express';

import ChapterController from '../controllers/chapter.controller.js';

import ChapterMiddleware from '../middlewares/chapter.middleware.js';
import UploadMiddleware from '../middlewares/upload.middleware.js';

import {
    auth as Authorize,
    easyAuth,
} from '../middlewares/session.middleware.js';

const router = express.Router();

router.post(
    '/',
    Authorize('Scan'),
    UploadMiddleware.upload_many_manga,
    ChapterMiddleware.valid_store,
    ChapterController.store,
);
router.get(
    '/',
    easyAuth(),
    ChapterMiddleware.valid_list,
    ChapterController.list,
);
router.get(
    '/findOne',
    easyAuth(),
    ChapterMiddleware.valid_findOne,
    ChapterController.findOne,
);
router.put(
    '/',
    Authorize('Scan'),
    ChapterMiddleware.valid_update,
    ChapterController.update,
);
router.delete(
    '/',
    Authorize('Scan'),
    ChapterMiddleware.valid_remove,
    ChapterController.remove,
);

export default router;
