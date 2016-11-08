'use strict';

const app = require('../src/app');

const UserService = app.service('users');
 
var adminUser, user1, user2;
var adminAuthToken, user1AuthToken, user2AuthToken;


const mockAdminUser = {
	firstName: 'Admin',
	lastName: 'MockUser',
    email: 'admin@test.org',
    password: 't3stpa$$w0rd0',
    roles: ['admin']
};


const mockUser1 = {
	firstName: 'One',
	lastName: 'MockUser',
    email: 'user1@test.org',
    password: 't3stpa$$w0rd1',
    roles: ['user']
};


const mockUser2 = {
	firstName: 'Two',
	lastName: 'MockUser',
    email: 'user2@test.org',
    password: 't3stpa$$w0rd2',
    roles: ['user']
};

/**
 *
 * Returns a Promise to create mock users and log them in
 *
 */
function createMockUsers(chai) {

    return Promise.all([

       		// Create mock users...
		    UserService.create(Object.assign({}, mockAdminUser))
		        .then(user => { adminUser = user; }),

		    UserService.create(Object.assign({}, mockUser1))
		        .then(user => { user1 = user; }),

		    UserService.create(Object.assign({}, mockUser2))
		        .then(user => { user2 = user; }),
    ])


	.then(function() {

      const loginCredentials = { email: mockAdminUser.email, password: mockAdminUser.password};

	     // Authenticate admin...
        return chai.request(app)
            .post('/auth/local')
            .set('Accept', 'application/json')
            .send(loginCredentials);
	})


    .then(function(res) {

          adminAuthToken = res.body.token;

          const loginCredentials = { email: mockUser1.email, password: mockUser1.password };

		    // Authenticate user1...
	        return chai.request(app)
	            .post('/auth/local')
	            .set('Accept', 'application/json')
	            .send(loginCredentials);
	})


    .then(function(res) {

          user1AuthToken = res.body.token;

          const loginCredentials = { email: mockUser2.email, password: mockUser2.password };

		    // Authenticate user2...
	        return chai.request(app)
	            .post('/auth/local')
	            .set('Accept', 'application/json')
	            .send(loginCredentials);
	})

    .then(function(res) {
        user2AuthToken = res.body.token;
    });

}

/**
 *
 * Returns a Promise to clean up all the mock users that were created
 *
 */
function cleanupMockUsers() {

   adminUser = undefined;
   user1 = undefined;
   user2 = undefined;
   adminAuthToken = undefined;
   user1AuthToken = undefined;
   user2AuthToken = undefined;
   return Promise.all([
        UserService.remove(null),
   ]);

}

class MockUsers {

    constructor() {
    	this.mockAdminUser = mockAdminUser;
    	this.mockUser1 = mockUser1;
    	this.mockUser2 = mockUser2;
    }

	get adminUser() {
		if (!adminUser) {
			throw new Error('adminUser Not valid until after CreateMockUsers() completes Promise.');
		}
		return adminUser;
	}

	get user1() {
		if (!user1) {
			throw new Error('user1 Not valid until after CreateMockUsers() completes Promise.');
		}
		return user1;
	}

	get user2() {
		if (!user2) {
			throw new Error('user2 Not valid until after CreateMockUsers() completes Promise.');
		}
		return user2;
	}

	get adminAuthToken() {
		if (!adminAuthToken) {
			throw new Error('adminAuthToken Not valid until after CreateMockUsers() completes Promise.');
		}
		return adminAuthToken;
	}

	get user1AuthToken() {
		if (!user1AuthToken) {
			throw new Error('user1AuthToken Not valid until after CreateMockUsers() completes Promise.');
		}
		return user1AuthToken;
	}

	get user2AuthToken() {
		if (!user2AuthToken) {
			throw new Error('user2AuthToken Not valid until after CreateMockUsers() completes Promise.');
		}
		return user2AuthToken;
	}
    
    CreateMockUsers(chai) {
    	return createMockUsers(chai);
    }

    CleanupMockUsers() {
    	return cleanupMockUsers();
    }
}

module.exports = new MockUsers();

