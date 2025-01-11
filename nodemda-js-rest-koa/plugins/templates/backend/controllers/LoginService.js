const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { SECRET_KEY } = require('../config/auth');

// Register a new user
exports.registerUser = async (ctx) => {
  try {
    const { username, password } = ctx.request.body;
    console.log(`Registering user with username: ${username}`);
    // Prevent users from registering with the Admin role
    const user = new User({ username, password, role: 'User' });
    await user.save();
    ctx.status = 201;
    ctx.body = { message: 'User created' };
  } catch (error) {
    ctx.throw(400, 'Invalid data');
  }
};

// Login a user
exports.loginUser = async (ctx) => {
  const { username, password } = ctx.request.body;
  console.log(`Executing loginUser with username: ${username}`);
  const user = await User.findOne({ username });
  if (!user || !(await user.comparePassword(password))) {
    ctx.throw(401, 'Invalid username or password');
  }
  const token = jwt.sign({ id: user._id, roles: user.roles }, SECRET_KEY, { expiresIn: '1h' });
  ctx.body = { token };
};

// Fetch the current logged-in user
exports.fetchCurrentUser = async (ctx) => {
  const userId = ctx.state.user.id;
  const user = await User.findById(userId).select('-password'); // Exclude password from the response
  if (!user) {
    ctx.body = { username: 'guest', roles: ['guest'] }
  }
  else {
    ctx.body = user;
  }
};
