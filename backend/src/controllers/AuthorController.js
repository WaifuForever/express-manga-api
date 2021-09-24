import fs from "fs";
import { parseISO } from "date-fns";

import Author from "../models/Author.js";
import Manga from "../models/Manga.js";

import { getMessage } from "../common/messages.js";

async function store(req, res) {
	const { type, name, birthDate, socialMedia, deathDate, biography } = req.body;
	const new_token = req.new_token ? req.new_token : null;
	req.new_token = null;

	const storedAuthor = await Author.findOne({ name: name });

	if (storedAuthor !== null) {
		if (storedAuthor.type.includes(type)) {
			Object.keys(req.files).forEach((i) => {
				let file = req.files[i];
				fs.unlinkSync(
					"uploads/" + "authors/" + type + "/" + name + "/" + file.filename
				);
			});

			return res.jsonBadRequest(
				null,
				getMessage("author.error.duplicate"),
				new_token
			);
		} else {
			storedAuthor.type.push(type);
			storedAuthor
				.save()
				.then((result) => {
					Object.keys(req.files).forEach((i) => {
						let file = req.files[i];
						fs.unlinkSync(
							"uploads/" + "authors/" + type + "/" + name + "/" + file.filename
						);
					});
					return res.jsonOK(
						result,
						getMessage("author.save.success"),
						new_token
					);
				})
				.catch((err) => {
					console.log(err);
					Object.keys(req.files).forEach((i) => {
						let file = req.files[i];
						fs.unlinkSync(
							"uploads/" +
								"authors/" +
								storedAuthor.type +
								"/" +
								name +
								"/" +
								file.filename
						);
					});
					return res.jsonServerError(null, null, err);
				});
		}
	} else {
		req.auth = null;

		let jsonString = [];

		Object.keys(req.files).forEach((i) => {
			let file = req.files[i];

			let temp = {
				originalname: file.originalname,
				size: file.size,
				filename: file.filename,
			};

			jsonString.push(JSON.parse(JSON.stringify(temp)));
		});

		const author = new Author({
			photos: [],
			type: [type],
			name: name,
			birthDate: parseISO(birthDate),
			deathDate: deathDate ? parseISO(deathDate) : null,
			socialMedia: socialMedia,
			biography: biography,

			//comments?
		});
		author.photos = jsonString;

		author
			.save()
			.then((result) => {
				return res.jsonOK(result, getMessage("author.save.success"), new_token);
			})
			.catch((err) => {
				console.log(err);
				Object.keys(req.files).forEach((i) => {
					let file = req.files[i];
					fs.unlinkSync(
						"uploads/" + "authors/" + type + "/" + name + "/" + file.filename
					);
				});
				return res.jsonServerError(null, null, err);
			});
	}
}

async function read(req, res) {
	const { author_id } = req.query;
	const new_token = req.new_token ? req.new_token : null;
	req.new_token = null;

	if (author_id) {
		const author = await Author.findById(author_id).exec();

		if (author === null) {
			return res.jsonNotFound(author, getMessage("author.notfound", new_token));
		}
		return res.jsonOK(author, getMessage("author.read.success"), new_token);
	} else {
		return res.jsonBadRequest(null, null, null);
	}
}

async function list(req, res) {
	const { type, name } = req.query;
	const new_token = req.new_token ? req.new_token : null;
	req.new_token = null;

	let docs = [];

	if (type) {
		if (name) {
			(
				await Author.find({
					name: { $regex: name, $options: "i" },
					type: type,
				}).sort("updatedAt")
			).forEach(function (doc) {
				docs.push(doc);
			});
		} else {
			(await Author.find({ type: type }).sort("updatedAt")).forEach(function (
				doc
			) {
				docs.push(doc);
			});
		}
	} else if (name) {
		(
			await Author.find({ name: { $regex: name, $options: "i" } }).sort(
				"updatedAt"
			)
		).forEach(function (doc) {
			docs.push(doc);
		});
	} else {
		(await Author.find().sort("updatedAt")).forEach(function (doc) {
			docs.push(doc);
		});
	}

	if (docs.length === 0) {
		return res.jsonNotFound(docs, getMessage("author.list.empty"), new_token);
	} else {
		return res.jsonOK(
			docs,
			getMessage("author.list.success") + ": " + docs.length,
			new_token
		);
	}
}

async function update(req, res) {
	const new_token = req.new_token ? req.new_token : null;
	req.new_token = null;
	req.body.updatedAt = Date.now();

	if (await Author.exists({ name: req.body.name }))
		return res.jsonBadRequest(
			null,
			getMessage("author.error.overwrite"),
			new_token
		);

	Author.findByIdAndUpdate(req.body.author_id, req.body)
		.select({ type: 1, name: 1 })
		.then((doc) => {
			if (!doc) {
				return res.jsonNotFound(null, getMessage("author.notfound"), new_token);
			} else {
				let temp = req.body.type ? req.body.type : doc.type;

				if (req.body.name) {
					const currPath = `./uploads/authors/${doc.type}/${doc.name}`;
					const newPath = `./uploads/authors/${temp}/${req.body.name}`;

					fs.rename(currPath, newPath, function (err) {
						if (err) {
							console.log(err);
						} else {
							console.log("Successfully renamed the directory.");
						}
					});
				}

				return res.jsonOK(doc, getMessage("author.update.success"), new_token);
			}
		})
		.catch((err) => {
			return res.jsonServerError(err, null, new_token);
		});
}

async function remove(req, res) {
	const { author_id } = req.query;
	const author = await Author.findById(author_id);

	const new_token = req.new_token ? req.new_token : null;
	req.new_token = null;

	if (author) {
		Author.deleteOne({ _id: author_id })
			.then((answer) => {
				let mangas = [];
				let dir =
					"uploads/" + "authors/" + author.type + "/" + author.name + "/";

				author.photos.forEach((file) => {
					fs.unlinkSync(dir + file.filename);
				});

				fs.rmdir(dir, { recursive: true }, (err) => {
					if (err) {
						console.log(err);
					}
				});

				fs.rmdirSync(dir, { recursive: true });

				author.works.forEach((manga_id) => {
					Manga.findById(manga_id)
						.then((manga) => {
							manga[author.type] = manga[author.type].filter(function (crt_id) {
								return crt_id.toString() !== author_id.toString();
							});
							manga
								.save()
								.then((answer) => {
									mangas.push({ "author-deleted": manga_id });
								})
								.catch((err) => {
									mangas.push({ "author-not-deleted": manga_id });
								});
						})
						.catch((err) => {
							mangas.push({ "manga-not-found": manga_id });
						});
				});
				return res.jsonOK(
					{ removed: true, mangas: mangas },
					getMessage("author.delete.success"),
					new_token
				);
			})
			.catch((err) => {
				return res.jsonBadRequest(
					null,
					getMessage("author.notfound"),
					new_token
				);
			});
	} else {
		return res.jsonServerError(null, null, new_token);
	}
}

export default { store, read, list, update, remove };
