const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users');
const { isGuest, isLogged } = require('../middlewares/guards');

// TODO: put back guards when fixed!
router.post('/register', usersController.register);
router.post('/login', usersController.login);
router.post('/logout', usersController.logout);

module.exports = router;