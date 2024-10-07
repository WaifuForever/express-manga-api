import mongoose from 'mongoose';

const chapter = {
    manga_id: mongoose.Types.ObjectId().toString(),
    title: 'The search',
    number: 52,
    language: 'en',
    _id: '',
};

const chapter2 = {
    manga_id: mongoose.Types.ObjectId().toString(),
    title: 'The Beginning',
    number: 1,
    language: 'en',
    _id: '',
};

export { chapter, chapter2 };
