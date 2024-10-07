import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
    {
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true, select: false },

        role: {
            type: String,
            default: 'User',
        },

        name: {
            type: String,
            required: true,
        },

        mangas: [
            {
                //a array fill with the mangas ids
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Manga',
            },
        ],

        manga_alert: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Manga',
            },
        ],

        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],

        reviews: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Manga',
            },
        ],

        token_version: {
            type: Number,
            default: 0,
        },

        active: {
            type: Boolean,
            default: false,
        },

        resetLink: {
            type: String,
            default: '',
        },
    },
    { timestamps: true },
);

export default mongoose.model('User', UserSchema);
