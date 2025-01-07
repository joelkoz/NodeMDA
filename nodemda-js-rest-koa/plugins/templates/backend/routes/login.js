const Router = require('koa-router');
const { isAdmin } = require('../config/auth');
const loginService = require('../controllers/LoginService');

const router = new Router({
  prefix: '/api/v1',
});

// Route to register a new user
router.post('/register', loginService.registerUser);

// Route to login a user
router.post('/login', loginService.loginUser);

// Route to fetch the current logged-in user
router.get('/users/current', loginService.fetchCurrentUser);

module.exports = router;
