const router = require('express').Router();
const meetings = require('./meetings');
const users = require('./users');

router.get('/', (req, res) => {
    res.json([]);
})

router.use('/meetings', meetings)
router.use('/users', users);

module.exports = router;