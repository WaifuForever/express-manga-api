import mongoose from 'mongoose';
import yup from 'yup';
import { parseISO, isDate, addYears, subYears } from 'date-fns';

import { getMessage } from '../utils/message.util.js';

const genres = [
    'action',
    'adventure',
    "boys' love",
    'comedy',
    'crime',
    'drama',
    'fantasy',
    "girls' love",
    'historical',
    'horror',
    'isekai',
    'magical girls',
    'mecha',
    'medical',
    'mystery',
    'philosophical',
    'psychological',
    'romance',
    'sci-fi',
    'slice of life',
    'sports',
    'superhero',
    'thriller',
    'tragedy',
    'wuxia',
];

const themes = [
    'aliens',
    'animals',
    'cooking',
    'crossdressing',
    'deliquents',
    'demons',
    'genderswap',
    'ghosts',
    'gyaru',
    'harem',
    'incest',
    'loli',
    'mafia',
    'magic',
    'martial arts',
    'military',
    'monster girls',
    'monsters',
    'music',
    'ninja',
    'office workers',
    'police',
    'post-apocalyptic',
    'reincarnation',
    'reverse harem',
    'samurai',
    'school life',
    'shota',
    'supernatural',
    'survival',
    'time travel',
    'traditional games',
    'vampires',
    'video games',
    'villainess',
    'virtual reality',
    'zombies',
];

const languages = [
    'da',
    'nl',
    'en',
    'fi',
    'fr',
    'de',
    'hu',
    'it',
    'nb',
    'pt',
    'ro',
    'ru',
    'tr',
    'es',
];

function parseDateString(value, originalValue) {
    const parsedDate = isDate(originalValue)
        ? new Date(originalValue)
        : parseISO(originalValue, 'yyyy-MM-dd', new Date());

    return parsedDate;
}

function isValidMongoIdRequired(value) {
    return (
        mongoose.Types.ObjectId.isValid(value) &&
        String(new mongoose.Types.ObjectId(value)) === value
    );
}

function isValidMongoId(value) {
    if (!!value) {
        mongoose.Types.ObjectId.isValid(value) &&
            String(new mongoose.Types.ObjectId(value)) === value;
    }
    return true;
}
const mongo_id = yup
    .string()
    .test('isValidMongoId', getMessage('invalid.object.id'), value =>
        isValidMongoId(value),
    );
const mongo_id_req = yup
    .string()
    .test('isValidMongoId', getMessage('invalid.object.id'), value =>
        isValidMongoIdRequired(value),
    );

const name = yup
    .string('name must be a string.')
    .min(3, getMessage('yup.invalid.name.short'))
    .max(20, getMessage('yup.invalid.name.long'));

const manga_rules = {
    title: yup
        .string('title must be a string.')
        .min(2, getMessage('manga.invalid.title.short'))
        .max(60, getMessage('manga.invalid.title.long')),
    genres: yup
        .array(yup.string())
        .min(3, '')
        .max(5, '')
        .test(
            'Valid genres',
            'Not all given ${path} are valid options',
            function (items) {
                if (items) {
                    return items.every(item => {
                        return genres.includes(item.toLowerCase());
                    });
                }

                return false;
            },
        ),
    themes: yup
        .array(yup.string())
        .min(3, '')
        .max(5, '')
        .test(
            'Valid themes',
            'Not all given ${path} are valid options',
            function (items) {
                if (items) {
                    return items.every(item => {
                        return themes.includes(item.toLowerCase());
                    });
                }
                return false;
            },
        ),

    synopsis: yup
        .string('synopsis must be a string.')
        .min(10, getMessage('manga.invalid.synopsis.short'))
        .max(400, getMessage('manga.invalid.synopsis.long')),
    n_chapters: yup
        .number('chapters must be a number.')
        .min(1, 'There must be at least one chapter.'),
    status: yup
        .number('status must be a number.')
        .min(1, getMessage('manga.invalid.code'))
        .max(6, getMessage('manga.invalid.code')),
    nsfw: yup.string('nsfw must be a string.').matches(/(true|false)/, null),
    type: yup
        .string('type must be a string.')
        .matches(/^manga$|^manhwa$|^manhua$/, null)
        .default({ type: 'manga' }),
    languages: yup
        .array(yup.string())
        .min(1, '')
        .max(languages.length, '')
        .default(['pt'])
        .test(
            'Valid languages',
            'Not all given ${path} are valid options',
            function (items) {
                if (items) {
                    return items.every(item => {
                        return languages.includes(item.toLowerCase());
                    });
                }
                return false;
            },
        ),

    _id: mongo_id_req,
    id_not_required: mongo_id,
    artist_id: mongo_id_req,
    writer_id: mongo_id_req,
};

const author_rules = {
    types: yup
        .array('types must be an array.')
        .of(
            yup
                .string('the array must contains only strings.')
                .lowercase()
                .matches(/(^writer$|^artist$)/),
        )
        .ensure()
        .min(1, 'Need to provide at least one type')
        .max(2, 'Can not provide more than two types'),
    type: yup.string('type must be a string.').matches(/(^writer$|^artist$)/),
    _id: mongo_id_req,
    name: name,

    birthDate: yup
        .date()
        .transform(parseDateString)
        .max(subYears(new Date(), 5)),
    deathDate: yup
        .date()
        .transform(parseDateString)
        .when(
            'birthDate',
            (birthDate, yup) =>
                birthDate &&
                yup.min(
                    addYears(birthDate, 10),
                    'death date must be at least 10 years longer than birthDate',
                ),
        ),
    socialMedia: yup
        .array(yup.string('socialMedia must be a string.'))
        .min(1, '')
        .max(5, ''),
    biography: yup
        .string('biography')
        .min(15, getMessage('author.invalid.biography.short')),
};

const chapter_rules = {
    id_not_required: mongo_id,
    _id: mongo_id_req,
    manga_id: yup
        .string('manga title must be a string.')
        .max(60, getMessage('manga.invalid.title.long')),
    title: yup
        .string('title must be a string.')
        .max(40, getMessage('chapter.invalid.title.long')),
    number: yup
        .number('Must to be a valid number')
        .min(1, 'Must be a positive number'),

    language: yup
        .string('language must be a string.')
        .default('pt')
        .test(
            'Valid language',
            'This value for ${path} is not a valid option',
            value => {
                return languages.includes(value.toLowerCase());
            },
        ),
};

const review_rules = {
    _id: mongo_id_req,
    id_not_required: mongo_id,
    rating: yup
        .number('rating must be a number.')
        .min(0, 'The minimum limit is 0.')
        .max(5, 'The maximum limit is 5.'),
    text: yup
        .string('text must be a string.')
        .min(2, getMessage('text.invalid.text.short'))
        .max(500, getMessage('text.invalid.text.long')),
};

const user_rules = {
    _id: mongo_id_req,
    email: yup.string().email().required(),
    name: name,
    password: yup
        .string()
        .min(8, getMessage('user.invalid.password.short'))
        .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
            getMessage('user.invalid.password.weak'),
        )
        .required(),

    role: yup.string().matches(/(Scan|User)/, null),
    sign_in_password: yup
        .string()
        .min(8, getMessage('user.invalid.password.short'))
        .required(),
};

export { manga_rules, author_rules, user_rules, chapter_rules, review_rules };
