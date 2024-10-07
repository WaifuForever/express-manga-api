const allowedOrigins = ['http://localhost:3000'];

const headers = [
    'Origin',
    'Access-Control-Allow-Origin',
    'Content-Type',
    'Accept',
    'Authorization',
    'Origin',
    'X-Requested-With',
    /*"Access-Control-Request-Method",*/ 'Access-Control-Allow-Credentials' /*"Access-Control-Request-Header"*/,
];
const corsOptionsDelegate = function (req, callback) {
    var corsOptions;
    if (allowedOrigins.indexOf(req.header('Origin')) !== -1) {
        corsOptions = { origin: true }; // reflect (enable) the requested origin in the CORS response
    } else {
        corsOptions = { origin: false }; // disable CORS for this request
        //console.log("Origin not allowed");
    }

    (corsOptions.allowedHeaders = headers),
        (corsOptions.methods = ['GET', 'PUT', 'POST', 'DELETE']);
    corsOptions.credentials = true;
    callback(null, corsOptions); // callback expects two parameters: error and options
};

export default corsOptionsDelegate;
