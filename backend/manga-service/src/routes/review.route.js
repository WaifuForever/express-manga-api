import express from 'express';

import ReviewController from '../controllers/review.controller.js';

import ReviewMiddleware from '../middlewares/review.middleware.js';

import {
    auth as Authorize,
    easyAuth,
} from '../middlewares/session.middleware.js';

const router = express.Router();

router.post(
    '/',
    Authorize('User'),
    ReviewMiddleware.store,
    ReviewController.store,
);
router.get('/', easyAuth(), ReviewMiddleware.list, ReviewController.list);
router.get(
    '/findOne',
    easyAuth(),
    ReviewMiddleware.findById,
    ReviewController.findOne,
);
router.put(
    '/',
    Authorize('User'),
    ReviewMiddleware.update,
    ReviewController.update,
);
router.delete(
    '/',
    Authorize('User'),
    ReviewMiddleware.findById,
    ReviewController.remove,
);

export default router;
