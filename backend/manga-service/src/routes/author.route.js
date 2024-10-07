import express from 'express';
import multer from 'multer';

import AuthorController from '../controllers/author.controller.js';

import AuthorMiddleware from '../middlewares/author.middleware.js';
import multerConfig from '../config/multer.config.js';

import {
    auth as Authorize,
    easyAuth,
} from '../middlewares/session.middleware.js';

const router = express.Router();
const upload = multer(multerConfig.authorFiles).array('imgCollection');

router.post(
    '/',
    Authorize('Scan'),
    upload,
    AuthorMiddleware.store,
    AuthorController.store,
);
router.put(
    '/',
    Authorize('Scan'),
    upload,
    AuthorMiddleware.update,

    AuthorController.update,
);
router.get('/', easyAuth(), AuthorMiddleware.list, AuthorController.list);
router.get(
    '/findOne',
    easyAuth(),
    AuthorMiddleware.findById,
    AuthorController.findOne,
);
router.delete(
    '/',
    Authorize('Scan'),
    AuthorMiddleware.findById,
    AuthorController.remove,
);

export default router;
