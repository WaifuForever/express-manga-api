import supertest from 'supertest';

import { app } from '../../src/config/express.config.js';
import { getMessage } from '../../src/utils/message.util.js';
import { artist, writer } from '../mocks/author.mock.js';
import { photo } from '../mocks/image.mock.js';

const itif = condition => (condition ? it : it.skip);
const createAuthor = (payload, token) => {
    it('POST /authors', async () => {
        await supertest(app)
            .post('/authors')
            .field(payload)
            .set('Authorization', 'Bearer ' + token)

            .attach('imgCollection', photo.dir + photo.name)
            .expect(200)
            .then(response => {
                //console.log(response.body);
                // Check type and length
                expect(
                    typeof response.body === 'object' &&
                        !Array.isArray(response.body) &&
                        response.body !== null,
                ).toBeTruthy();

                expect(response.body.data).toBeDefined();
                expect(response.body.metadata).toBeDefined();

                expect(
                    response.body.data.birthDate.startsWith(payload.birthDate),
                ).toBeTruthy();
                response.body.data.imgCollection.forEach(element => {
                    expect(element.filename.endsWith(photo.name)).toBeTruthy();
                });

                expect(response.body).toMatchObject({
                    message: getMessage('author.save.success'),
                    data: schema(payload, photo),
                    metadata: {},
                    status: 200,
                });

                if (
                    payload.types.includes('writer') ||
                    payload.types === 'writer'
                )
                    writer._id = response.body.data._id;
                else artist._id = response.body.data._id;
            });
    });

    it('GET /authors/findOne', async () => {
        await supertest(app)
            .get(`/authors/findOne?_id=${payload._id}`)
            .expect(200)
            .then(response => {
                // Check type and length
                expect(
                    typeof response.body === 'object' &&
                        !Array.isArray(response.body) &&
                        response.body !== null,
                ).toBeTruthy();

                expect(response.body).toMatchObject({
                    message: getMessage('author.findone.success'),
                    data: schema(payload, photo),
                    metadata: {},
                    status: 200,
                });
            });
    });
};

const findAuthor = payload => {
    it('GET /authors/findOne', async () => {
        await supertest(app)
            .get(`/authors/findOne?_id=${payload._id}`)
            .expect(200)
            .then(response => {
                // Check type and length
                expect(
                    typeof response.body === 'object' &&
                        !Array.isArray(response.body) &&
                        response.body !== null,
                ).toBeTruthy();

                expect(response.body).toMatchObject({
                    message: getMessage('author.findone.success'),
                    data: schema(payload, photo),
                    metadata: {},
                    status: 200,
                });
            });
    });
};

const listAuthor = (payload, number) => {
    it(`GET /authors ${number} documents`, async () => {
        await supertest(app)
            .get('/authors')
            .send({})
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
                        getMessage('author.list.success'),
                    ),
                ).toBeTruthy();
                expect(response.body.status).toEqual(200);
                expect(response.body).toMatchObject({
                    message: `Author list retrieved successfully: ${number}`,
                    data: payload.map(x => {
                        return schema(x, photo);
                    }),
                    metadata: {},
                    status: 200,
                });
            });
    });
};

const deleteAuthor = (payload, token) => {
    it('DELETE /authors', async () => {
        payload._id = payload._id === 1 ? writer._id : artist._id;
        await supertest(app)
            .delete(`/authors?_id=${payload._id}`)

            .set('Authorization', 'Bearer ' + token)
            .expect(200)
            .then(response => {
                // Check type and length
                expect(
                    typeof response.body === 'object' &&
                        !Array.isArray(response.body) &&
                        response.body !== null,
                ).toBeTruthy();

                expect(response.body.data.mangas).toBeDefined();
                expect(response.body.data.removed).toBeTruthy();
                expect(
                    response.body.message.startsWith(
                        getMessage('author.delete.success'),
                    ),
                ).toBeTruthy();
            });
    });

    it('GET /authors/findOne', async () => {
        await supertest(app)
            .get(`/authors/findOne?_id=${payload._id}`)
            .expect(404)
            .then(response => {
                // Check type and length
                expect(
                    typeof response.body === 'object' &&
                        !Array.isArray(response.body) &&
                        response.body !== null,
                ).toBeTruthy();

                expect(response.body).toMatchObject({
                    message: getMessage('author.notfound'),
                    data: null,
                    metadata: {},
                    status: 404,
                });
            });
    });
};

const updateAuthor = (payload, token, message) => {
    it(`PUT /authors ${message}`, async () => {
        payload._id = payload._id === 1 ? writer._id : artist._id;

        await supertest(app)
            .put('/authors')
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
                    message: getMessage('author.update.success'),
                    data: null,
                    metadata: {},
                    status: 200,
                });
            });
    });

    it('GET check previous PUT operation', async () => {
        await supertest(app)
            .get(`/authors/findOne?_id=${payload._id}`)
            .expect(200)
            .then(response => {
                // Check type and length
                expect(
                    typeof response.body === 'object' &&
                        !Array.isArray(response.body) &&
                        response.body !== null,
                ).toBeTruthy();

                expect(response.body).toMatchObject({
                    message: getMessage('author.findone.success'),
                    data: payload,
                    metadata: {},
                    status: 200,
                });
            });
    });
};

const schema = (payload, photo) => {
    return {
        types:
            typeof payload.types === 'string' || payload.types instanceof String
                ? [payload.types]
                : payload.types,
        imgCollection: [
            {
                mimetype: photo.mimetype,
                size: photo.size,
            },
        ],
        works: [],
        socialMedia: payload.socialMedia,
        //_id: '617f58e87ab874251ce7cd58',
        name: payload.name,
        biography: payload.biography,
        __v: 0,
    };
};

const updateSchema = payload => {
    return {
        type: [payload.type],
        _id: payload._id,
        name: payload.name,
    };
};

export { createAuthor, updateAuthor, listAuthor, findAuthor, deleteAuthor };
