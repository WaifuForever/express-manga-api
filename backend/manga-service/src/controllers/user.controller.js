import nodemailer from 'nodemailer';
import ProtonMail from 'protonmail-api';
//import smtpTransport from 'nodemailer-smtp-transport';

import User from '../models/user.model.js';

import { TEST_E2E_ENV } from '../utils/constant.util.js';
import jwt from '../utils/jwt.util.js';
import { encrypt, decrypt, hashPassword } from '../utils/password.util.js';
import { getMessage } from '../utils/message.util.js';

const Protonmail = false;

async function sendEmail(email, activationToken) {
    if (process.env.NODE_ENV !== TEST_E2E_ENV) {
        if (Protonmail) {
            console.log('aqui - 0');
            const pm = await ProtonMail.connect({
                username: `${process.env.EMAIL_USER}`,
                password: `${process.env.EMAIL_PASSWORD}`,
            });
            console.log('aqui - 1');
            await pm.sendEmail({
                to: email,
                subject: getMessage('user.activation.account.subject'),
                body: `
			<h2>${getMessage('user.activation.account.text')}</h2>
			<p>${process.env.CLIENT_URL}/activateaccount/${activationToken}</p>
			
		`,
            });

            pm.close();
        } else {
            // create reusable transporter object using the default SMTP transport
            let transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: `${process.env.GMAIL_USER}`, // generated ethereal user
                    pass: `${process.env.GMAIL_PASSWORD}`, // generated ethereal password
                },

                tls: {
                    rejectUnauthorized: false,
                },
            });

            const mailOptions = {
                from: `${process.env.GMAIL_USER}`, // sender address
                to: email, // receiver (use array of string for a list)
                subject: getMessage('user.activation.account.subject'), // Subject line
                html: `
					<h2>${getMessage('user.activation.account.text')}</h2>
					<a href="${process.env.CLIENT_URL}/activateaccount/${activationToken}">
					${getMessage(
                        'user.activation.account.text.subtitle',
                    )}                               
					<a/>
					
				`, // plain text body
            };

            transporter.sendMail(mailOptions, (err, info) => {
                if (err) console.log(err);
                //else console.log(info);
            });
            transporter.close();
        }
    }
    return true;
}

async function store(req, res) {
    const { email, password, name, role } = req.body;

    User.find({ email: email })
        .select({ _id: 1, email: 1, active: 1 })
        .then(user => {
            if (user[0].active) {
                return res.jsonBadRequest(
                    null,
                    getMessage('user.error.sign_up.duplicatekey'),
                    null,
                );
            } else {
                const tkn = jwt.generateJwt(
                    {
                        id: encrypt(user[0]._id.toString()),
                    },
                    3,
                );

                sendEmail(email, tkn)
                    .then(info => {
                        return res.jsonOK(
                            null,
                            getMessage('user.activation.account.activate'),
                            process.env.NODE_ENV === TEST_E2E_ENV ? tkn : null,
                        );
                    })
                    .catch(err => {
                        console.log(err);
                        return res.jsonBadRequest(null, null, { err });
                    });
            }
        })
        .catch(err => {
            const p1 = new User({
                email: email,
                password: async () => await hashPassword(password),
                name: name,
                role: role ? role : 'User',
            });

            p1.save()
                .then(result => {
                    result.password = undefined;

                    const activationToken = jwt.generateJwt(
                        { id: encrypt(p1._id.toString()) },
                        3,
                    );

                    // async..await is not allowed in global scope, must use a wrapper
                    // Generate test SMTP service account from ethereal.email

                    sendEmail(email, activationToken)
                        .then(info => {
                            //console.log(getMessage("user.activation.account.activate"));
                            return res.jsonOK(
                                null,
                                getMessage('user.activation.account.activate'),
                                process.env.NODE_ENV === TEST_E2E_ENV
                                    ? activationToken
                                    : null,
                            );
                        })
                        .catch(err => {
                            console.log(err);
                            return res.jsonBadRequest(null, null, err);
                        });
                })
                .catch(err => {
                    console.log(err);
                    if (err.name === 'MongoError' && err.code === 11000) {
                        //next(new Error("There was a duplicate key error"));
                        return res.jsonBadRequest(
                            null,
                            getMessage('user.error.sign_up.duplicatekey'),
                            { err },
                        );
                    } else {
                        return res.jsonBadRequest(null, null, { err });
                    }
                });
        });
}

async function findOne(req, res) {
    const { user_id } = req.query;

    const new_token = req.new_token ? req.new_token : null;
    req.new_token = null;

    User.findById(user_id)
        .then(doc => {
            return res.jsonOK(
                doc,
                getMessage('user.findone.success'),
                new_token,
            );
        })
        .catch(err => {
            return res.jsonServerError(null, null, null);
        });
}

async function list(req, res) {
    const { name } = req.query;

    const new_token = req.new_token ? req.new_token : null;
    req.new_token = null;

    let role = req.role ? decrypt(req.role) : 0;

    req.role = null;

    let search =
        role === 1
            ? name
                ? { name: { $regex: '^' + name, $options: 'i' } }
                : {}
            : name
            ? { name: { $regex: '^' + name, $options: 'i' }, active: true }
            : { active: true };

    let docs = [];

    (await User.find(search)).forEach(function (doc) {
        docs.push(doc);
    });

    res.jsonOK(docs, getMessage('user.list.success') + docs.length, new_token);
}

async function update(req, res) {
    const { name } = req.body;
    const new_token = req.new_token ? req.new_token : null;
    req.new_token = null;

    User.findOne({
        _id: decrypt(req.auth),
        active: true,
    }).then(user => {
        user.name = name;
        user.save()
            .then(result => {
                return res.jsonOK(
                    null,
                    getMessage('user.update.name.success'),
                    new_token,
                );
            })
            .catch(err => {
                return res.jsonServerError(null, null, new_token);
            });
    });
}

async function remove(req, res) {
    const { user_id } = req.query;
    console.log(user_id);

    User.findOne({ _id: user_id })
        .then(result => {
            User.deleteOne({ _id: user_id }, function (err) {
                if (err) {
                    return res.jsonNotFound(
                        null,
                        getMessage('user.delete.fail'),
                        err.message,
                    );
                } else {
                    return res.jsonOK(
                        null,
                        getMessage('user.delete.success'),
                        result,
                    );
                }

                // deleted at most one tank document
            });
        })
        .catch(err => {
            return res.jsonNotFound(
                null,
                getMessage('user.error.notfound'),
                err.message,
            );
        });
}

export default { store, findOne, list, update, remove };
