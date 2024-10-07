import supertest from 'supertest';
import mongoose from 'mongoose';

import { app } from '../../src/config/express.config.js';
import { CHAPTER_PROJECTION } from '../../src/utils/constant.util.js';
import { chapter } from '../mocks/chapter.mock.js';
import { photo } from '../mocks/image.mock.js';
import { getMessage } from '../../src/utils/message.util.js';

const createChapter = (payload, token) => {
    it('POST /chapters', async () => {
        const request = supertest(app);
        let filledArray = new Array(10).fill(photo.dir + photo.name);

        let requestInstance = request
            .post('/chapters')
            .set('Authorization', 'Bearer ' + token)
            .field(payload);

        for (const file of filledArray) {
            // no need to reassign requestInstance because it's same instance
            // requestInstance = requestInstance.attach('file', file);
            requestInstance.attach('imgCollection', file);
        }
        await requestInstance.expect(200).then(response => {
            // Check type and length
            expect(
                typeof response.body === 'object' &&
                    !Array.isArray(response.body) &&
                    response.body !== null,
            ).toBeTruthy();

            expect(response.body.data.imgCollection.length).toBe(
                filledArray.length,
            );
            expect(response.body.data).toBeDefined();
            expect(response.body.metadata).toBeDefined();
            payload._id = response.body.data._id;

            expect(response.body).toMatchObject({
                message: getMessage('chapter.save.success'),
                data: payload,
                metadata: {},
                status: 200,
            });
        });
    });

    it('GET /chapters/findOne ', async () => {
        await supertest(app)
            .get(`/chapters/findOne?_id=${payload._id}`)

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
                    message: getMessage('chapter.findone.success'),
                    data: schema(payload, CHAPTER_PROJECTION[1]),
                    metadata: {},
                    status: 200,
                });
            });
    });
};

const updateChapter = (payload, token, message) => {
    it(`PUT /chapters ${message}`, async () => {
        payload._id = payload._id === 1 ? chapter._id : chapter2._id;
        await supertest(app)
            .put('/chapters')
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

                expect(response.body).toMatchObject({
                    message: getMessage('chapter.update.success'),
                    data: null,
                    metadata: {},
                    status: 200,
                });
                let bool = payload._id === chapter._id;
                Object.keys(payload).forEach(function (value) {
                    if (bool) chapter[value] = payload[value];
                    else chapter2[value] = payload[value];
                });
            });
    });

    it('GET check previous PUT operation', async () => {
        await supertest(app)
            .get(`/chapters/findOne?_id=${payload._id}`)
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
                    message: getMessage('chapter.findone.success'),
                    data: payload,
                    metadata: {},
                    status: 200,
                });
            });
    });
};

const findChapter = (payload, auth) => {
    it('GET /chapters/findOne?_id=', async () => {
        const request = auth
            ? supertest(app)
                  .get(`/chapters/findOne?_id=${payload._id}`)
                  .set('Authorization', 'Bearer ' + auth.token)
            : supertest(app).get(`/chapters/findOne?_id=${payload._id}`);

        await request.expect(200).then(response => {
            // Check type and length
            expect(
                typeof response.body === 'object' &&
                    !Array.isArray(response.body) &&
                    response.body !== null,
            ).toBeTruthy();

            expect(response.body).toMatchObject({
                message: getMessage('chapter.findone.success'),
                data: schema(payload, CHAPTER_PROJECTION[auth ? auth.role : 0]),
                metadata: {},
                status: 200,
            });
        });
    });
};

const listChapter = (payload, manga_id, number, auth) => {
    it(`GET /chapters ${number} documents`, async () => {
        let path = mongoose.Types.ObjectId.isValid(manga_id)
            ? `/chapters?manga_id=${manga_id}`
            : `/chapters?manga_title=${manga_id}`;

        const request = auth
            ? supertest(app)
                  .get(path)
                  .set('Authorization', 'Bearer ' + auth.token)
            : supertest(app).get(path);

        await request
            .send({})
            .expect(200)
            .then(response => {
                // Check type and length
                expect(
                    typeof response.body === 'object' &&
                        !Array.isArray(response.body) &&
                        response.body !== null,
                ).toBeTruthy();

                payload.sort((a, b) => a.number - b.number);
                response.body.data.sort((a, b) => a.number - b.number);

                expect(response.body).toMatchObject({
                    message: getMessage('chapter.list.success') + number,
                    data: payload.map(x => {
                        return schema(
                            x,
                            CHAPTER_PROJECTION[auth ? auth.role : 0],
                        );
                    }),
                    metadata: {},
                    status: 200,
                });
            });
    });
};

const deleteChapter = (payload, token) => {
    it('DELETE /chapters', async () => {
        await supertest(app)
            .delete(`/chapters?_id=${payload._id}`)

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
                    message: getMessage('chapter.delete.success'),
                    data: { deletedCount: 1, n: 1, ok: 1 },
                    metadata: {},
                    status: 200,
                });
            });
    });

    it('GET /chapters/findOne', async () => {      
        await supertest(app)
            .get(`/chapters/findOne?_id=${payload._id}`)
            .expect(404)
            .then(response => {
                // Check type and length
                expect(
                    typeof response.body === 'object' &&
                        !Array.isArray(response.body) &&
                        response.body !== null,
                ).toBeTruthy();

                expect(response.body).toMatchObject({
                    message: getMessage('chapter.notfound'),
                    data: null,
                    metadata: {},
                    status: 404,
                });
            });
    });
};

const schema = (payload, projection) => {
    let temp = {};
    Object.keys(projection).forEach(function (value) {
        if (projection[value] === 1 && payload[value])
            temp[value] = payload[value];
    });
    return temp;
};

export {
    createChapter,
    updateChapter,
    findChapter,
    listChapter,
    deleteChapter,
};
