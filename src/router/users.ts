const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users');
const { isGuest, isLogged } = require('../middlewares/guards');

router.post('/register', isGuest(), usersController.register);
router.post('/login', isGuest(), usersController.login);
router.post('/logout', isLogged(), usersController.logout);

module.exports = router;