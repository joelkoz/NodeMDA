'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const chaiAsPromised = require('chai-as-promised');
const assert = require('assert');
const app = require('../../../src/app');
const authentication = require('feathers-authentication/client');
const bodyParser = require('body-parser');
const MockUsers = require('../../MockUsers.js');

const mockUser3 = {
	firstName: 'John',
	lastName: 'Doe',
    email: 'john.doe@test.org',
    password: 't3stpa$$w0rd1',
};


//config for app to do authentication
app
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  .configure(authentication());

// Add useful plugins to Chai
chai.use(chaiHttp);
chai.use(chaiAsPromised);

//use should
var should = chai.should();
var expect = chai.expect;

describe('AccountService service', function() {


  before(function(done) {

    //start the server
    this.server = app.listen(3030);

    //once listening do the following
    this.server.once('listening', () => {
    	MockUsers.CreateMockUsers(chai)
    	.then(function() {
    		done();
    	});
	});
  });


  after(function() {
    const server = this.server;

    // delete the mock data from mongodb
    return Promise.all([
    	MockUsers.CleanupMockUsers()
    ]).then(function() {
        server.close(function() {});
    });
  });


  it('registered the AccountServices service', () => {
    assert.ok(app.service('AccountService/:op'));
  });


  it('should allow SignUp call', function() {

  		return chai.request(app)

  			.post('/AccountService/SignUp')
        	.set('Accept', 'application/json')
        	.send(Object.assign({}, mockUser3))

        	.then(function(res) {
        		expect(res).to.have.status(201);
        		res.body.should.have.property('firstName');
        		res.body.firstName.should.equal(mockUser3.firstName);
        		res.body.should.have.property('_id');
        	});
	});


    it('should deny second SignUp call', function() {

      console.log('Expecting 403');
  		return chai.request(app)

  			.post('/AccountService/SignUp')
        	.set('Accept', 'application/json')
        	.send(Object.assign({}, mockUser3))

        	.then(
        		function(res) {
        			throw new Error('Creation of duplicate account should have failed.');
        		},

        		function(err) {
        			// This is the correct successful path - to have failed to create the duplicate.
        			expect(err).to.have.status(403);
        		}
        	);
    });



    it('should deny unauthenticated user to remove an account', function() {

      console.log('Expecting 401');
  		return chai.request(app)

  			.post('/AccountService/Remove')
        	.set('Accept', 'application/json')
        	.send(Object.assign({}, { email: mockUser3.email, password: mockUser3.password }))

        	.then(
        		function(res) {
        			throw new Error('Removal of account by unauthenticated user.');
        		},

        		function(err) {
        			// This is the correct successful path - to have failed to remove the unowned entity.
        			expect(err).to.have.status(401);
        		}
        	);
    });



    it('should deny authenticated user to remove their own email without original credentials', function() {

      const loginCredentials = { email: mockUser3.email, password: mockUser3.password };

      console.log('Expecting 403');
	    return chai.request(app)

              // First, login...
	            .post('/auth/local')
	            .set('Accept', 'application/json')
	            .send(loginCredentials)

	            .then(res => {
	               let authToken = res.body.token;

	               // Now, request the removal...
      			  		return chai.request(app)
                      .post('/AccountService/Remove')
                      .set('Accept', 'application/json')  
                      .set('Authorization', 'Bearer '.concat(authToken))
                      .send(Object.assign({}, { email: mockUser3.email, password: 'typo_' + mockUser3.password }));
	            })

	            .then(
    	        		function(res) {
  	           			throw new Error('Should have denied request to remove email address.');
	            		},

    	        		function(err) {
	             			expect(err).to.have.status(403);
	            		}
	            );
    });



    it('should allow user to remove their own account', function() {

      const loginCredentials = { email: mockUser3.email, password: mockUser3.password };

	    return chai.request(app)

              // First, login...
	            .post('/auth/local')
	            .set('Accept', 'application/json')
	            .send(loginCredentials)

	            .then(res => {
	               let authToken = res.body.token;

                  // Now, request the removal...
                  return chai.request(app)
                      .post('/AccountService/Remove')
                      .set('Accept', 'application/json')
                      .set('Authorization', 'Bearer '.concat(authToken))
                      .send(Object.assign({}, { email: mockUser3.email, password: mockUser3.password }));
  	          })

             .then(
                function(res) {
                  expect(res).to.have.status(201);
                }
	           );
	});


});
