import mongoose from 'mongoose';

import { artist, writer } from '../../../mocks/author.mock.js';
import { userToken, scanToken } from '../../../mocks/jwt.mock.js';
import {
    createAuthor,
    updateAuthor,
    deleteAuthor,
    findAuthor,
    listAuthor,
} from '../../../helpers/author.helper.js';

describe('Author', () => {
    let mockToken = scanToken(mongoose.Types.ObjectId().toString());

    createAuthor(artist, mockToken);
    createAuthor(writer, mockToken);

    listAuthor([artist, writer], 2);
    findAuthor(writer);

    updateAuthor({ _id: 1, name: 'George Masara' }, mockToken, 'update name');
    updateAuthor({ _id: 1, types: ['artist'] }, mockToken, 'update type');

    deleteAuthor({ author_id: 1 }, mockToken);
});
