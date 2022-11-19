const router = require('express').Router();
const meetings = require('./meetings');
const users = require('./users');

router.use('/meetings', meetings)
router.use('/users', users);

module.exports = router;