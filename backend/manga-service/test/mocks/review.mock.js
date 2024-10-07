import mongoose from 'mongoose';

const user1 = mongoose.Types.ObjectId().toString();

const review = {
    text: 'this one is terrible, dont waste your time',
    rating: 1,    
    user_id: user1,
    manga_id: mongoose.Types.ObjectId().toString(),
    _id: '',
    __v: 0,
};

const review2 = {
    text: 'this one is very good, has changed my life',
    rating: 4.3,
    user_id: mongoose.Types.ObjectId().toString(),
    manga_id: mongoose.Types.ObjectId().toString(),
    _id: '',
    __v: 0,
};

const review3 = {
    text: 'I really appreciate that.',
    rating: 3.5,    
    user_id: user1,
    manga_id: mongoose.Types.ObjectId().toString(),
    _id: '',
    __v: 0,
};

export { review, review2, review3 };
