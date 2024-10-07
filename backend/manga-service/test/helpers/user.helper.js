import supertest from 'supertest';

import { app } from '../../src/config/express.config.js';
import { getMessage } from '../../src/utils/message.util.js';
import jwt from '../../src/utils/jwt.util.js';
import { user, scan, fake_user } from '../mocks/user.mock.js';

let activationToken;

const createUser = payload => {
    it('POST /sign-up', async () => {
        await supertest(app)
            .post('/sign-up')
            .send(payload)
            .expect(200)
            .then(response => {
                expect(
                    typeof response.body === 'object' &&
                        !Array.isArray(response.body) &&
                        response.body !== null,
                ).toBeTruthy();

                activationToken = response.body.metadata;
                expect(response.body).toEqual({
                    message: getMessage('user.activation.account.activate'),
                    data: null,
                    metadata: expect.any(String),
                    status: 200,
                });
            });
    });

    it('POST /authentication/activate/:tky', async () => {
        await supertest(app)
            .post('/authentication/activate/' + activationToken)
            .expect(200)
            .then(response => {
                // Check type and length
                expect(
                    typeof response.body === 'object' &&
                        !Array.isArray(response.body) &&
                        response.body !== null,
                ).toBeTruthy();

                expect(response.body).toEqual({
                    message: getMessage('user.valid.sign_up.success'),
                    data: null,
                    metadata: {},
                    status: 200,
                });
            });
        if (payload.role === 'User') user.active = true;
        else scan.active = true;
    });

    it('GET /sign-in', async () => {
        await supertest(app)
            .get('/sign-in')
            .auth(payload.email, payload.password)
            .expect(200)
            .then(response => {
                // Check type and length
                expect(
                    typeof response.body === 'object' &&
                        !Array.isArray(response.body) &&
                        response.body !== null,
                ).toBeTruthy();

                if (payload.role === 'User') {
                    user.token = response.body.metadata.token;
                    user._id = response.body.data._id;
                } else {
                    scan.token = response.body.metadata.token;
                    scan._id = response.body.data._id;
                }

                expect(response.body).toMatchObject({
                    message: getMessage('user.valid.sign_in.success'),
                    data: sign_in(payload),
                    metadata: {},
                    status: 200,
                });
            });
    });

    it('GET /users/findOne', async () => {
        await supertest(app)
            .get(`/users/findOne?user_id=${payload._id}`)
            .send({})
            .expect(200)
            .then(response => {
                // Check type and length
                expect(
                    typeof response.body === 'object' &&
                        !Array.isArray(response.body) &&
                        response.body !== null,
                ).toBeTruthy();

                expect(response.body).toMatchObject({
                    message: getMessage('user.findone.success'),
                    data: schema(payload),
                    metadata: {},
                    status: 200,
                });
            });
    });
};

const schema = payload => {
    return {
        role: payload.role,
        mangas: [],
        manga_alert: [],
        likes: [],
        reviews: [],
        token_version: 0,
        active: payload.active,
        resetLink: '',
        email: payload.email,
        name: payload.name,

        __v: 0,
    };
};

const sign_in = payload => {
    return {
        role: payload.role,
        token_version: 0,
        _id: payload._id,
    };
};

export { createUser, schema, sign_in };
