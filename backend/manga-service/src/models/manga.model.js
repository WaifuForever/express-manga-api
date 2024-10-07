import mongoose from 'mongoose';
import ImageSchema from './image.model.js';

const MangaSchema = new mongoose.Schema(
    {
        imgCollection: [ImageSchema],
        title: {
            type: String,
            unique: true,
        },
        writer_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Author',
        },
        artist_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Author',
        },
        genres: [
            {
                type: String,
            },
        ],
        themes: [
            {
                type: String,
            },
        ],
        type: String,
        synopsis: String,
        n_chapters: {
            type: Number,
            default: 0,
        },
        status: Number,
        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        user_alert: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        nsfw: {
            type: Boolean,
            default: false,
        },
        languages: [
            {
                type: String,
            },
        ],
        chapters: [
            {
                //a array fill with the data links
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Chapter',
            },
        ],
        scan_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },

        rating: {
            type: Number,
            default: 0,
        },
        reviews: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Review',
            },
        ],
    },
    { timestamps: true },
);

export default mongoose.model('Manga', MangaSchema);
