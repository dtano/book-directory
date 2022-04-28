require('dotenv').config;
const express = require('express');
const router = express.Router();

// const {authenticateToken} = require('../middleware/authentication');
const userService = require('../services/userService');

const jwt = require('jsonwebtoken');

router.post('/login', async (req, res) => {
    const username = req.body.username;

    // Get the user
    //const user = await userService.getUser({username: username});
    const user = {username: username};

    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
    res.json({accessToken: accessToken});
});

router.post('/register', (req, res) => {

});

module.exports = router;