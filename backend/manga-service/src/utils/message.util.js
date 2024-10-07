import fs from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const messages = JSON.parse(fs.readFileSync(__dirname + '/messages.json'));

export const getMessage = path => {
    return messages[path] || null;
};
