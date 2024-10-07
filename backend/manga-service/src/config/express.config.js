import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import authRoute from '../routes/authentication.route.js';
import authorRoute from '../routes/author.route.js';
import chapterRoute from '../routes/chapter.route.js';
import mangaRoute from '../routes/manga.route.js';
import reviewRoute from '../routes/review.route.js';
import userRoute from '../routes/user.route.js';

import corsOptionsDelegate from './cors.config.js';
import limiter from './limiter.config.js';

import { response } from '../middlewares/response.middleware.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/files', express.static('uploads'));

app.use(cookieParser());
app.use(cors(corsOptionsDelegate));
app.use(limiter); // limiting all requests
app.use(response);

app.use(authRoute);
app.use('/authors', authorRoute);
app.use('/chapters', chapterRoute);
app.use('/mangas', mangaRoute);
app.use('/reviews', reviewRoute);
app.use('/users', userRoute);

export { app };
