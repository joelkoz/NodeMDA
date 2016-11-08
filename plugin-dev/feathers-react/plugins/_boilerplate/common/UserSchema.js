const OmniSchema = require('omni-schema');

const Types = OmniSchema.Types;

const UserSchema = OmniSchema.compile({
 
  facebookId: { type: 'String' },
  facebook: { type: 'Object' },

  googleId: { type: 'String' },
  google: { type: 'Object' },


  firstName: { type: 'FirstName', required: false },
  lastName: { type: 'LastName', required: false },
  email: {type: 'Email', required: true, db: { unique: true }},
  password: { type: 'Password', required: true },
  roles: [ { type: 'String' } ],
  
  createdAt: { type: 'DateTime', default: Date.now },
  updatedAt: { type: 'DateTime', default: Date.now }
});

module.exports = UserSchema;
