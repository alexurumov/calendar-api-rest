const router = require('express').Router();
const meetings = require('./meetings');
const users = require('./users');
const auth = require('../middlewares/auth');
const { isLogged } = require('../middlewares/guards');

router.use('/meetings', auth(), isLogged(), meetings)
router.use('/users', auth(), users);

module.exports = router;