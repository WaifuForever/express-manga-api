export const TEST_E2E_ENV = 'e2e';
export const TEST_UNIT_ENV = 'unit';
export const TEST_INT_ENV = 'int';
export const DEV_ENV = 'dev';
export const PROD_ENV = 'prod';

export const MANGA_PROJECTION = {
    0: {
        title: 1,
        genre: 1,
        synopsis: 1,
        n_chapters: 1,
        status: 1,
        nsfw: 1,
        rating: 1,
        imgCollection: 1,
        type: 1,
        likes: 1,
        themes: 1,
        genres: 1,
        languages: 1,
        writer_id: 1,
        artist_id: 1,
        _id: 0,
    },
    1: {
        updatedAt: 1,
        createdAt: 1,
        title: 1,
        genre: 1,

        type: 1,
        synopsis: 1,
        n_chapters: 1,
        _id: 1,
        languages: 1,
        nsfw: 1,
        status: 1,
        writer_id: 1,
        artist_id: 1,
        scan_id: 1,
        rating: 1,
        themes: 1,
        genres: 1,
        likes: 1,
       
        imgCollection: 1,
    },
    2: {
        _id: 1,
        __v: 1,
        title: 1,
        genre: 1,
        synopsis: 1,
        n_chapters: 1,
        imgCollection: 1,
        rating: 1,
        writer_id: 1,
        artist_id: 1,
        type: 1,
        themes: 1,
        genres: 1,
        nsfw: 1,
        status: 1,
        languages: 1,
        likes: 1,
    },
};

export const CHAPTER_PROJECTION = {
    0: {
        title: 1,
        imgCollection: 1,
        views: 1,
        _id: 1,
    },  
    1: {
        title: 1,
        imgCollection: 1,
        views: 1,
        number: 1,
        manga_id: 1,
        language: 1,
        updatedAt: 1,
        createdAt: 1,
        _id: 1,
    },
    2: {
        title: 1,
        imgCollection: 1,
        views: 1,
        language: 1,
        _id: 1,
    },
};
