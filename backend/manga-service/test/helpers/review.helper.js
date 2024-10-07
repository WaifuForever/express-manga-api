import supertest from 'supertest';

import { app } from '../../src/config/express.config.js';
import { review } from '../mocks/review.mock.js';
import { photo } from '../mocks/image.mock.js';
import { getMessage } from '../../src/utils/message.util.js';

const createReview = (payload, token) => {
    it('POST /reviews', async () => {
        await supertest(app)
            .post('/reviews')
            .set('Authorization', 'Bearer ' + token)
            .send(payload)
            .expect(200)
            .then(response => {
                // Check type and length
                expect(
                    typeof response.body === 'object' &&
                        !Array.isArray(response.body) &&
                        response.body !== null,
                ).toBeTruthy();

                expect(response.body.data).toBeDefined();
                expect(response.body.metadata).toBeDefined();

                expect(response.body).toMatchObject({
                    message: getMessage('review.save.success'),
                    data: schema(payload),
                    metadata: {},
                    status: 200,
                });

                payload._id = response.body.data._id;
            });
    });

    it('GET /reviews/findOne ', async () => {
        await supertest(app)
            .get(`/reviews/findOne?_id=${payload._id}`)
            .set('Authorization', 'Bearer ' + token)
            .expect(200)
            .then(response => {
                // Check type and length
                expect(
                    typeof response.body === 'object' &&
                        !Array.isArray(response.body) &&
                        response.body !== null,
                ).toBeTruthy();

                expect(response.body).toMatchObject({
                    message: getMessage('review.findone.success'),
                    data: schema(payload),
                    metadata: {},
                    status: 200,
                });
            });
    });
};

const updateReview = (payload, token, message) => {
    it(`PUT /reviews ${message}`, async () => {
        payload._id = payload._id === 1 ? review._id : review2._id;
        await supertest(app)
            .put('/reviews')
            .send(payload)
            .set('Authorization', 'Bearer ' + token)
            .expect(200)
            .then(response => {
                // Check type and length
                expect(
                    typeof response.body === 'object' &&
                        !Array.isArray(response.body) &&
                        response.body !== null,
                ).toBeTruthy();
                let bool = payload._id === review._id;
                Object.keys(payload).forEach(function (value) {
                    if (bool) review[value] = payload[value];
                    else review2[value] = payload[value];
                });
                expect(response.body).toMatchObject({
                    message: getMessage('review.update.success'),
                    data: payload,
                    metadata: {},
                    status: 200,
                });
                
            });
    });

    it('GET check previous PUT operation', async () => {
        await supertest(app)
            .get(`/reviews/findOne?_id=${payload._id}`)
            .send({})
            .set('Authorization', 'Bearer ' + token)
            .expect(200)
            .then(response => {
                // Check type and length
                expect(
                    typeof response.body === 'object' &&
                        !Array.isArray(response.body) &&
                        response.body !== null,
                ).toBeTruthy();

                expect(response.body).toMatchObject({
                    message: getMessage('review.findone.success'),
                    data: payload,
                    metadata: {},
                    status: 200,
                });
            });
    });
};

const findReview = payload => {
    it('GET /reviews/findOne', async () => {
        await supertest(app)
            .get(`/reviews/findOne?_id=${payload._id}`)
            .expect(200)
            .then(response => {
                // Check type and length
                expect(
                    typeof response.body === 'object' &&
                        !Array.isArray(response.body) &&
                        response.body !== null,
                ).toBeTruthy();

                expect(response.body).toMatchObject({
                    message: getMessage('review.findone.success'),
                    data: schema(payload),
                    metadata: {},
                    status: 200,
                });
            });
    });
};

const listReview = (payload, selection, number) => {
  
    it(`GET /reviews ${number} documents`, async () => {
        const path = selection.user_id
            ? `/reviews?user_id=${selection.user_id}`
            : selection.manga_id
            ? `/reviews?manga_id=${selection.manga_id}`
            : `/reviews`;
        await supertest(app)
            .get(path)
            .send()
            .expect(200)
            .then(response => {
                // Check type and length
                expect(
                    typeof response.body === 'object' &&
                        !Array.isArray(response.body) &&
                        response.body !== null,
                ).toBeTruthy();

                payload.sort((a, b) => (a.text > b.text ? 1 : -1));
                response.body.data.sort((a, b) =>
                    a.text > b.text ? 1 : -1,
                );

                expect(response.body).toMatchObject({
                    message: getMessage('review.list.success') + number,
                    data: payload.map(x => {
                        return schema(x);
                    }),
                    metadata: {},
                    status: 200,
                });
            });
    });
};

const deleteReview = (payload, token) => {
    it('DELETE /reviews', async () => {
        await supertest(app)
            .delete(`/reviews?_id=${payload._id}`)

            .set('Authorization', 'Bearer ' + token)
            .expect(200)
            .then(response => {
                // Check type and length
                expect(
                    typeof response.body === 'object' &&
                        !Array.isArray(response.body) &&
                        response.body !== null,
                ).toBeTruthy();

            
                expect(
                    response.body.message.startsWith(
                        getMessage('review.delete.success'),
                    ),
                ).toBeTruthy();
            });
    });

    it('GET /reviews/findOne', async () => {
        await supertest(app)
            .get(`/reviews/findOne?_id=${payload._id}`)
            .expect(404)
            .then(response => {
                // Check type and length
                expect(
                    typeof response.body === 'object' &&
                        !Array.isArray(response.body) &&
                        response.body !== null,
                ).toBeTruthy();

                expect(response.body).toMatchObject({
                    message: getMessage('review.notfound'),
                    data: null,
                    metadata: {},
                    status: 404,
                });
            });
    });
};

const schema = payload => {
    return {
        text: payload.text,
        rating: payload.rating,
        manga_id: payload.manga_id,
    };
};

export { createReview, findReview, listReview, updateReview, deleteReview };
