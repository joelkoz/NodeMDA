const dotenv = require('dotenv'); // Import dotenv module
const jwt = require('jsonwebtoken'); // Import jsonwebtoken module
const koaJwt = require('koa-jwt'); // Import koa-jwt middleware

dotenv.config(); // Load environment variables from .env file

const SECRET_KEY = process.env.SECRET_KEY; // Get the secret key from environment variables

// Middleware to check if the user has the Admin role
const isAdmin = async (ctx, next) => {
  if (ctx.state.user.role !== 'Admin') {
    ctx.throw(403, 'Access denied');
  }
  await next();
};

// JWT Middleware to protect routes
const jwtMiddleware = koaJwt({ secret: SECRET_KEY });

// Export the necessary modules
module.exports = {
  SECRET_KEY,
  isAdmin,
  jwtMiddleware,
};
