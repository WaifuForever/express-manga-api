import express from 'express';

import LikeController from '../controllers/like.controller.js';
import NotifyController from '../controllers/notify.controller.js';
import UserController from '../controllers/user.controller.js';

import UserMiddleware from '../middlewares/user.middleware.js';

import {
    auth as Authorize,
    easyAuth,
} from '../middlewares/session.middleware.js';

const router = express.Router();

router.get(
    '/findOne',
    easyAuth(),
    UserMiddleware.findOne,
    UserController.findOne,
);
router.get('/', easyAuth(), UserMiddleware.list, UserController.list);
router.put(
    '/',
    Authorize(['Scan', 'User']),
    UserMiddleware.update,
    UserController.update,
);
router.delete(
    '/',
    Authorize(['Scan', 'User']),
    UserMiddleware.remove,
    UserController.remove,
);
router.put('/like', Authorize('User'), LikeController.likeUser);
//router.get('//review',  easyAuth(), MangaMiddleware.review_list, ReviewController.list);
router.get('/notify', Authorize('Scan'), NotifyController.notifyUsers);

export default router;
