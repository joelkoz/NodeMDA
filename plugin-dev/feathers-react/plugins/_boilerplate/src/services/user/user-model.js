'use strict';

// user-model.js - A mongoose model


const mongoose = require('mongoose');
const UserSchema = require('common/UserSchema');

const userModel = mongoose.model('user', UserSchema.getMongooseSchema());

module.exports = userModel;