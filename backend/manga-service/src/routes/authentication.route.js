import express from 'express';

import UserController from '../controllers/user.controller.js';
import SessionController from '../controllers/session.controller.js';

import UserMiddleware from '../middlewares/user.middleware.js';

import {
    auth as Authorize,
    easyAuth,
} from '../middlewares/session.middleware.js';
import { getMessage } from '../utils/message.util.js';

const router = express.Router();

router.get('/', (req, res) => {
    return res.jsonOK(null, getMessage('default.return'), null);
});

router.get('/me', Authorize(), SessionController.me);

router.post('/authentication/activate/:tky', SessionController.activateAccount); // POST
router.put('/authentication/recover/:tky', SessionController.recoverPassword); // PUT

router.post(
    '/google-sign-up',
    UserMiddleware.google_sign_up,
    UserController.store,
);
router.post('/sign-up', UserMiddleware.sign_up, UserController.store);

router.get('/sign-in', UserMiddleware.sign_in, SessionController.sign_in);
router.post('/google-sign-in', SessionController.google_sign_in);

router.get('/refresh-token', SessionController.refreshAccessToken);

export default router;
