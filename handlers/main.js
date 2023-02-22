const {check} = require('../utility/hash.js'), User = require('../models/user.js'),
	  {checkEmail, checkPassword, checkPhoneNumber} = require('../utility/creds.js'),
	  {v4:uuid} = require('uuid'), db = require('../data/main.js'),
	  {assignToken} = require('../models/token.js'), {allowedUpdates} = 

class handles{
	static async postSignup(req, res){
		try{
			const user = new User(req.body);
	        if (!(user.firstName && user.lastName && user.age && user.email && user.phoneNumber && user.password)) {
	            return res.status(400).send({
	                status: 'error',
	                message: 'signup information not provided'
	            });
	        }
	        if(!checkPassword(user.password)){
	            return res.status(400).send({
	                status: 'error',
	                message: 'weak password'
	            });
	        }
	        if (!checkEmail(user.email)) {
	            return res.status(400).send({
	                status: 'error',
	                message: 'invalid email address'
	            });
	        }
	        if (!checkPhoneNumber(user.phoneNumber)) {
	            return res.status(400).send({
	                status: 'error',
	                message: 'invalid phone number'
	            });
	        }
	        if ((await db.verifyCredentials(user)) === true) {
	            return res.status(400).send({
	                status: 'error',
	                message: 'credentials already in use'
	            });
	        }
	        user.userId = uuid();
	        const error = await db.createUser(user);
	        if (error) {
	            return res.status(500).send({
	                status: 'error', message: error
	            });
	        }
	        assignToken(user);
	        delete user.userId, delete user.password;
	        res.status(200).send({
	        	status: 'ok',
	        	message: user
	        });
		}
		catch(error){
			console.log(1, error);
			res.status(500).send({status:'error'});
		}
	}

	static async postSignin(req, res){
		try {
	        const { email, password } = req.body;
	        if (!email || !password) {
	            return res.status(400).send({
	                status: 'error',
	                message: 'login information not provided'
	            });
	        }
	        const { error, data} = await db.userExists(email, password);
	        if (error || !data) {
	            return res.status(500).send({
	                status: 'error',
	                message: error
	            });
	        }
	        const user = new user(data);
	        user.userId = data.userId;
	        assignToken(user);
	        delete user.userId, delete user.password;
	        res.status(200).send({
	            status: 'ok',
	            message: user
	        });
	    }
	    catch (error) {
	        console.log(2, error);
	        res.status(500).send({ status: 'error' });
	    }
	}

	static async postSignout(req, res){
		invalidate(req.user.userId);
		res.status(200).send({ status:'ok' });
	}

	static async putUser(req, res){
		try{
			const user  = req.user;
			for(const field of updatesAllowed){
				if(req.body[field]){
					user[field] = req.body[field]; // exp
				}
			}
			const error = await db.updateUser(user);
			if(error){
				return res.status(500).send({status:'error', message:error});
			}
			res.status(200).send({status:'ok'});
		}
		catch(error){
			console.log(3, error);
			res.status(500).send({status:'error'});
		}
	}

	static async postPassword(req, res){
		try{
			const {givenOldPassword, newPassword} = req.body;
			if(!givenOldPassword || !newPassword){
				return res.status(400).send({status:'error', message:'Either or both of old and new passwords are missing!'});
			}
			if(!checkpassword(newPassword)){
				return res.status(400).send({
	                status: 'error',
	                message: 'weak password'
	            });
			}
			let { error, data} = await db.userExists(email, password);
			if(error){
				return res.status(500).send({status:'error', message:error});
			}
			if(!check(newPassword, data.password)){
				return res.status(404).send({status:'error', message:'Provided password does not match the existing password!'});
			}
			user.password = newPassword;
			error = await db.updateUser(user);
			if(error){
				return res.status(500).send({status:'error', message:error});
			}
			res.status(200).send({status:'ok'});
		}
		catch(error){
			console.log(4, error);
			res.status(500).send({status:'error'});
		}
	}
}

module.exports = handles;