import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema(
    {
        text: String,
        rating: Number,
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        manga_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Manga',
        },
    },
    { timestamps: true },
);

export default mongoose.model('Review', ReviewSchema);
