import mongoose from 'mongoose';
import http from 'http';
//import io from 'socket.io';

import { app } from './config/express.config.js';

const server = http.Server(app);

mongoose.connect(`${process.env.DB_CONNECTION}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
});

server.listen(parseInt(`${process.env.PORT}`), () => {
    console.log(`Listening on port ${process.env.PORT}`);
});
