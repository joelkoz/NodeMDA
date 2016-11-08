'use strict';

const hooks = require('./hooks');
const errors = require('feathers-errors');
const AccountServiceImpl = require('./AccountServiceImpl');
const Joi = require('joi');

class ServiceThunk {

  constructor(options) {
    this.options = options || {};

    this.SignUpSignature = { firstName: Joi.string().optional(), 
                             lastName: Joi.string().optional(), 
                             email:Joi.string().email().required(), 
                             password: Joi.string().required() };

     this.RemoveSignature = { email:Joi.string().email().required(), 
                              password: Joi.string().required() };                                   
  }


  setup(app) {
    this.accountServiceImpl = new AccountServiceImpl(app);
  }


  get(id, feathersParams) {
    return this.call(feathersParams.query, feathersParams);
  }


  create(data, feathersParams) {
    return this.call(data, feathersParams);
  }


  checkParams(params, methodSignature) {

     let validated = Joi.validate(params, methodSignature);
     if (validated.error !== null) {
         throw new errors.BadRequest(validated.error.details[0].message);
     }

     return validated.value;
  }


  call(opParams, feathersParams) {

    let validatedParams;
    feathersParams.Model = this.Model;

    if (!feathersParams.op) {
      throw new errors.BadRequest('No operation specified for AccountService');
    }

    switch (feathersParams.op) {

        case 'SignUp':
            validatedParams = this.checkParams(opParams, this.SignUpSignature);
            return Promise.resolve(this.accountServiceImpl.SignUp(validatedParams, feathersParams));

        case 'Remove':

            validatedParams = this.checkParams(opParams, this.RemoveSignature);
            return Promise.resolve(this.accountServiceImpl.Remove(validatedParams, feathersParams));
    }

    throw new errors.NotFound('Unknown operation: AccountService.' + feathersParams.op);
  }

}

module.exports = function(){
  const app = this;

  // Initialize our service with any options it requires
  app.use('/AccountService/:op', new ServiceThunk());

  // Get our initialize service to that we can bind hooks
  const AccountService = app.service('/AccountService/:op');

  // Set up our before hooks
  AccountService.before(hooks.before);

  // Set up our after hooks
  AccountService.after(hooks.after);
};

module.exports.Service = ServiceThunk;
