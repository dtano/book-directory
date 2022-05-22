const express = require('express');
const router = express.Router();
const {userLogin, registerUser} = require('../controllers/userController');

router.post('/login', async (req, res) => {
    await userLogin(req, res);
});

router.post('/register', async (req, res) => {
    await registerUser(req, res);
});

module.exports = router;