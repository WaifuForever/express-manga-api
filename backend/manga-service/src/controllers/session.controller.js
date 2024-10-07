import { OAuth2Client } from 'google-auth-library';

import User from '../models/user.model.js';
import jwt from '../utils/jwt.util.js';
import { decrypt, matchPassword } from '../utils/password.util.js';
import { getMessage } from '../utils/message.util.js';

async function refreshAccessToken(req, res) {
    const refreshToken = req.cookie.jid;
    if (!refreshToken) {
        return res.jsonUnauthorized(
            null,
            getMessage('unauthorized.refresh.token.missing'),
            null,
        );
    }
    console.log(refreshToken);
    let payload = null;
    try {
        payload = jwt.verifyJwt(refreshToken, 2);
    } catch (err) {
        console.log(err);
        return res.jsonUnauthorized(null, null, null);
    }
    User.findOne({ _id: payload.id, active: true })
        .then(result => {
            if (result) {
                try {
                    const accessToken = jwt.generateJwt(
                        {
                            id: result._id,
                            role: result.role,
                            token_version: result.token_version,
                        },
                        1,
                    );

                    return res.jsonOK(null, { accessToken: accessToken }, null);
                } catch (err) {
                    console.log(err);
                    return res.jsonUnauthorized(null, null, null);
                }
            } else {
                return res.jsonUnauthorized(null, null, null);
            }
        })
        .catch(err => {
            return res.jsonUnauthorized(null, null, err);
        });
}

async function google_sign_in(req, res) {
    const client = new OAuth2Client(process.env.CLIENT_ID);

    const { token } = req.body;
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID,
    });
    const { name, email, picture } = ticket.getPayload();

    console.log(ticket.getPayload());
    const user = await User.findOne({ email: email });

    if (user) {
        const token = jwt.generateJwt(
            {
                id: user._id,
                role: user.role,
                token_version: user.token_version,
            },
            1,
        );
        const refreshToken = jwt.generateJwt(
            {
                id: user._id,
                role: user.role,
                token_version: user.token_version,
            },
            2,
        );

        //req.headers.authorization = `Bearer ${token}`
        res.cookie('jid', refreshToken, {
            httpOnly: true,
            path: '/refresh-token',
        });

        user.password = undefined;
        return res.jsonOK(user, getMessage('user.valid.sign_in.success'), {
            token,
        });
    } else {
        const activationToken = jwt.generateJwt(
            { email: email, name: name },
            3,
        );

        return res.jsonOK(
            null,
            getMessage('user.sign_up.google.password.required'),
            { activationToken },
        );

        /*
		const p1 = new User ({
			email: email,
			password: null,
			name: name,
			role: "User"
		    
		});

		p1.save().then(result => {    
			result.password = undefined   
			 
			const activationToken = jwt.generateJwt({id: CryptoJs.AES.encrypt(p1._id.toString(), `${process.env.SHUFFLE_SECRET}`).toString()}, 3);
				   
			// async..await is not allowed in global scope, must use a wrapper
			// Generate test SMTP service account from ethereal.email
		 

			(async () => {

			  if(Protonmail){
			    
				const pm = await ProtonMail.connect({
				  username: `${process.env.EMAIL_USER}`,
				  password: `${process.env.EMAIL_PASSWORD}`
				})
			   
				await pm.sendEmail({
				  to: email,
				  subject: getMessage("user.activation.account.subject"),
				  body: `
					  <h2>${getMessage("user.activation.account.text")}</h2>
					  <p>${process.env.CLIENT_URL}/activateaccount/${activationToken}</p>
					  
				  `
				})
			    
				pm.close()
			  } else{
			    
				// create reusable transporter object using the default SMTP transport
				let transporter = nodemailer.createTransport({
				  service: "gmail",                     
				  auth: {
					user:  `${process.env.GMAIL_USER}`, // generated ethereal user
					pass: `${process.env.GMAIL_PASSWORD}` // generated ethereal password
				  },
									   
			   
				  tls: {
					rejectUnauthorized: false
				  }
		    
				});
			  
				const mailOptions = {
					from: `${process.env.GMAIL_USER}`, // sender address
					to: email, // receiver (use array of string for a list)
					subject: getMessage("user.activation.account.subject"), // Subject line
					html: `
						<h2>${getMessage("user.activation.account.text")}</h2>
						<a href="${process.env.CLIENT_URL}/activateaccount/${activationToken}">
						${getMessage("user.activation.account.text.subtitle")}                               
						<a/>
					   
					`// plain text body
				  };
			    
				transporter.sendMail(mailOptions, (err, info) => {
				if(err)
					console.log(err)
				else
					console.log(info);
				});               
			  
			  }                
			  
			})().then(info => {
				console.log(getMessage("user.activation.account.activate"))
				return res.jsonOK(result, getMessage("user.activation.account.activate"), null)              
								   
			}).catch(err => {
				return res.jsonBadRequest(null, null, {err});              
			    
			})           
					    

		}).catch(err => {
		    
			console.log(err)
			if (err.name === 'MongoError' && err.code === 11000) {
				//next(new Error('There was a duplicate key error'));
				return res.jsonBadRequest(null, getMessage("user.error.sign_up.duplicatekey"), {err})              
			    
		    
			} else {
				return res.jsonBadRequest(null, null, {err});             
								  
			}                           
		});    */
    }
    /*
	const user = new User.upsert({ 
		where: { email: email },
		update: { name, picture },
		create: { name, email, picture }
	})*/

    res.status(201);
    res.json(user);
}

async function sign_in(req, res) {
    const [hashType, hash] = req.headers.authorization.split(' ');

    if (hashType !== 'Basic') {
        return res.jsonUnauthorized(null, null, null);
    }

    const [email, supposedPassword] = Buffer.from(hash, 'base64')
        .toString()
        .split(':');

    const user = await User.findOne({ email: email, active: true }).select([
        'password',
        'role',
        'token_version',
    ]);

    const match = user ? matchPassword(user.password, supposedPassword) : null;

    if (!match) {
        return res.jsonBadRequest(null, null, null);
    } else {
        const token = jwt.generateJwt(
            {
                id: user._id,
                role: user.role,
                token_version: user.token_version,
            },
            1,
        );
        const refreshToken = jwt.generateJwt(
            {
                id: user._id,
                role: user.role,
                token_version: user.token_version,
            },
            2,
        );

        req.headers.authorization = `Bearer ${token}`;
        res.cookie('jid', refreshToken, {
            httpOnly: true,
            path: '/refresh-token',
        });

        user.password = undefined;
        return res.jsonOK(user, getMessage('user.valid.sign_in.success'), {
            token,
        });
    }
}

async function activateAccount(req, res) {
    try {
        const token = req.params.tky
            ? req.params.tky
            : () => {
                  throw 'token missing';
              };
        const decodedToken = jwt.verifyJwt(token, 3);

        User.findById(decrypt(decodedToken.id))
            .then(user => {
                if (user.active) {
                    console.log('user.active');
                    return res.jsonBadRequest(
                        null,
                        getMessage('user.activation.error.already.activated'),
                        null,
                    );
                }
                user.active = true;
                user.save().then(savedDoc => {
                    if (savedDoc === user) {
                        return res.jsonOK(
                            null,
                            getMessage('user.valid.sign_up.success'),
                            null,
                        );
                    } else {
                        return res.jsonServerError(null, null, null);
                    }
                });
            })
            .catch(err => {
                return res.jsonBadRequest(err, null, null);
            });
    } catch (err) {
        return res.jsonUnauthorized(err, null, null);
    }
}

async function me(req, res) {
    const new_token = req.new_token ? req.new_token : null;

    req.new_token = null;
    req.auth = null;

    return res.jsonOK(decrypt(req.auth), null, new_token);
}
//missing test
async function changeEmail(req, res) {
    const token = req.params.tky;
    const decodedToken = token ? await jwt.verifyJwt(token, 5) : null;

    if (!decodedToken) return res.jsonBadRequest(null, null, null);

    User.findById(decrypt(decodedToken.id))
        .then(user => {
            const email = decrypt(decodedToken.id);
            if (email) {
                user.email = email;
                user.save().then(savedDoc => {
                    if (savedDoc === user) {
                        return res.jsonOK(
                            user,
                            getMessage('user.update.email.success'),
                            null,
                        );
                    } else {
                        return res.jsonServerError(user, null, null);
                    }
                });
            } else {
                return res.jsonBadRequest(null, null, null);
            }
        })
        .catch(err => {
            return res.jsonBadRequest(err, null, null);
        });
}

//working on
async function recoverPassword(req, res) {
    const token = req.params.tky;

    if (token) {
        console.log('token exists');
        const decodedToken = await jwt.verifyJwt(token, 4);

        if (decodedToken) {
            console.log('DecodedToken: ' + decodedToken.id);
            User.findById(decrypt(decodedToken.id))
                .then(user => {
                    user.save().then(savedDoc => {
                        if (savedDoc === user) {
                            return res.jsonOK(
                                user,
                                getMessage('user.valid.sign_up.success'),
                                null,
                            );
                        } else {
                            return res.jsonServerError(user, null, null);
                        }
                    });
                })
                .catch(err => {
                    return res.jsonBadRequest(err, null, null);
                });
        } else {
            return res.jsonBadRequest(null, null, null);
        }
    } else {
        return res.jsonBadRequest(null, null, null);
    }
}

export default {
    refreshAccessToken,
    google_sign_in,
    sign_in,
    activateAccount,
    me,
    changeEmail,
    recoverPassword,
};
