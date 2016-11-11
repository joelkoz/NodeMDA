'use strict';

const errors = require('feathers-errors');
const bcrypt = require('bcryptjs-then');

class AccountServiceImpl {

    constructor(app) {
    	this.app = app;
    }

    get UserDao() {
    	return this.app.service('/Users');
    }


    /**
     * @todo Security: Do not allow a large number of sign up requests to come from same IP address within a certain time frame.
     */
	SignUp({ firstName, lastName, email, password }, feathersParams) {

		const users = this.UserDao;

        // Make sure email is unique...
		return users.find({ query: { email }})

					.then(otherUsers => {

						if (otherUsers.total > 0) {
							throw new errors.Forbidden('An account already exists with email ' + email);
						}

						let newUser = Object.assign({}, { firstName, lastName, email, password, roles: ['user'] });
						return users.create(newUser);
					});
	}



    /**
     * @todo Security: Do not allow random fishing with email/password combinations for same email address
     */
	Remove({ email, password }, feathersParams) {

		const users = this.UserDao;
		let user;

		if (!feathersParams.user) {
			throw new errors.NotAuthenticated('You must be authenticated to remove an account');
		}

		if (feathersParams.user.email !== email) {
			throw new errors.Forbidden('You are not permitted to remove an account other than your own.');
		}

		return users.find({ query: { email }})

					.then(userList => {

						if (userList.total !== 1) {
							throw new errors.Forbidden('You are not permitted to remove account with email ' + email);
						}

						// If we get here, we know we have a single user account with the specified email...
						user = userList.data[0];

						// Now, check to see if their password equals the specified password...
						return bcrypt.compare(password, user.password);
					})

					.then(valid => {
						if (!valid) {
							throw new errors.Forbidden('You must provide your original credentials to remove your account.');
						}

						return users.remove(user._id);
					});
	}

}


module.exports = AccountServiceImpl;
