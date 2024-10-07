import { manga, manga2 } from '../../../mocks/manga.mock.js';
import { userToken, scanToken } from '../../../mocks/jwt.mock.js';

import {
    createManga,
    updateManga,
    findManga,
    listManga,
    deleteManga,
} from '../../../helpers/manga.helper.js';


describe('Manga', () => {
    let mockToken = scanToken(manga.scan_id);

    createManga(manga, mockToken);
    createManga(manga2, mockToken);

    updateManga({ title: 'Gantz', _id: 1 }, mockToken, 'update name');
    findManga(manga, true);
    findManga(manga2, true);
    findManga(manga);
    listManga([manga2, manga], 2);

    deleteManga(manga, mockToken);
});
