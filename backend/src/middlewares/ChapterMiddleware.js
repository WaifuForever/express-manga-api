import yup from "yup";
import mongoose from "mongoose";

import { getMessage } from "../common/messages.js";

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

async function valid_store(req, res, next) {
	let schema = yup.object().shape({
		manga_title: yup
			.string("manga title must be a string.")
			.strict()
			.max(60, getMessage("manga.invalid.title.long")),
		chapter_title: yup
			.string("title must be a string.")
			.strict()
			.max(40, getMessage("chapter.invalid.title.long")),
		number: yup
			.number("Must to be a valid number")
			.min(1, "Must be a positive number")
			.required(),
		language: yup
			.string("language must be a string.")
			.strict()
			.matches(
				/^da$|^nl$|^en$|^fi$|^fr$|^de$|^hu$|^it$|^nb$|^pt$|^ro$|^ru$|^tr$|^es$/,
				null
			)
			.default({ language: "pt" })
			.required(),
	});
	try {
		await schema
			.validate(req.body)
			.then(() => {
				if (req.files.length) next();
				else return res.jsonBadRequest(null, null, null);
			})
			.catch(function (e) {
				return res.jsonBadRequest(null, null, e);
			});
	} catch (err) {
		return res.jsonBadRequest(null, null, err);
	}
}

async function valid_read(req, res, next) {
	let schema = yup.object().shape({
		chapter: yup
			.string()
			.strict()
			.required()
			.test("isValidMongoId", getMessage("invalid.object.id"), (value) =>
				isValidMongoIdRequired(value)
			),
	});

	try {
		schema
			.validate(req.query)
			.then(() => {
				next();
			})
			.catch((err) => {
				return res.jsonBadRequest(null, null, err.errors);
			});
	} catch (err) {
		return res.jsonBadRequest(null, null, err.errors);
	}
}

async function valid_list(req, res, next) {
	let schema = yup.object().shape({
		manga_id: yup
			.string("manga_id must be a string.")
			.strict()
			.test("isValidMongoId", getMessage("invalid.object.id"), (value) =>
				isValidMongoId(value)
			),
	});
	schema
		.validate(req.query)
		.then(() => {
			next();
		})
		.catch((err) => {
			return res.jsonBadRequest(null, null, err.errors);
		});
}

async function valid_update(req, res, next) {
	let schema = yup.object().shape({
		title: yup
			.string("title must be a string.")
			.strict()
			.max(40, getMessage("chapter.invalid.title.long"))
			.when(["number"], {
				is: (number) => !number,
				then: yup.string().required(),
			}),
		number: yup
			.number("Must to be a valid number")
			.min(1, "Must be a positive number")
			.when(["title"], {
				is: (title) => !title,
				then: yup.number().required(),
			}),
		chapter_id: yup
			.string("chapter_id must be a string.")
			.strict()
			.required()
			.test("isValidMongoId", getMessage("invalid.object.id"), (value) =>
				isValidMongoIdRequired(value)
			),

		language: yup
			.string("language must be a string.")
			.strict()
			.matches(
				/^da$|^nl$|^en$|^fi$|^fr$|^de$|^hu$|^it$|^nb$|^pt$|^ro$|^ru$|^tr$|^es$/,
				null
			)
			.default({ language: "pt" })
			.required(),
	});

	try {
		schema
			.validate(req.body)
			.then(() => {
				next();
			})
			.catch((err) => {
				return res.jsonBadRequest(null, null, err.errors);
			});
	} catch (err) {
		return res.jsonBadRequest(null, null, err.errors);
	}
}

async function valid_remove(req, res, next) {
	const { manga_id, chapter_id } = req.query;

	let schema = yup.object().shape({
		manga_id: yup
			.string()
			.strict()
			.required()
			.test("isValidMongoId", getMessage("invalid.object.id"), (value) =>
				isValidMongoIdRequired(value)
			),

		chapter_id: yup
			.string()
			.strict()
			.required()
			.test("isValidMongoId", getMessage("invalid.object.id"), (value) =>
				isValidMongoIdRequired(value)
			),
	});

	try {
		schema
			.validate(req.query)
			.then(() => {
				next();
			})
			.catch((err) => {
				return res.jsonBadRequest(null, null, err.errors);
			});
	} catch (err) {
		return res.jsonBadRequest(null, null, err.errors);
	}
}

export default {
	valid_store,
	valid_read,
	valid_list,
	valid_update,
	valid_remove,
};
