import mongoose from 'mongoose';

const manga = {
    title: 'Berserk',
    genres: ['action', 'horror', 'fantasy', 'psychological'],
    synopsis: 'A sad manga following a story of guy seeking revenge',
    artist_id: mongoose.Types.ObjectId().toString(),
    writer_id: mongoose.Types.ObjectId().toString(),
    scan_id: mongoose.Types.ObjectId().toString(),
    type: 'manga',
    themes: ['demons', 'ghosts', 'magic', 'supernatural'],
    n_chapters: 354,
    status: 2,
    languages: ['en', 'pt'],
    nsfw: 'true',
    _id: '',
    __v: 0,
};

const manga2 = {
    title: 'Vagabond',
    genres: ['action', 'philosophical', 'historical', 'tragedy'],
    synopsis: 'A story following Miyamoto Musashi',
    artist_id: mongoose.Types.ObjectId().toString(),
    writer_id: mongoose.Types.ObjectId().toString(),
    scan_id: mongoose.Types.ObjectId().toString(),
    type: 'manga',
    themes: ['martial arts', 'samurai', 'survival'],
    n_chapters: 354,
    status: 2,
    languages: ['en', 'pt'],
    nsfw: 'true',
    _id: '',
    __v: 0,
};

export { manga, manga2 };
