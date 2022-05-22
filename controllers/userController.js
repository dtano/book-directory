require('dotenv').config;

const {hashPassword, compareHash} = require('../middleware/authentication');
const userService = require('../services/userService');
const jwt = require('jsonwebtoken');

const INVALID_REQUEST_BODY_ERROR = 'Request body is invalid, please make sure the request body has the correct keys';
const INVALID_USERNAME_ERROR = 'Invalid username';
const INVALID_PASSWORD_ERROR = 'Invalid password';

const userLogin = async (req, res) => {
    const username = req.body.username;

    // Get the user
    const user = await userService.getUser({username: username});
    if(!user){
        res.status(500).json(INVALID_USERNAME_ERROR);
        return;
    }

    try{
        if(await compareHash(req.body.password, user.dataValues.password)){
            const accessToken = jwt.sign(user.dataValues, process.env.ACCESS_TOKEN_SECRET);
            res.json({accessToken: accessToken});
        }else{
            throw new Error(INVALID_PASSWORD_ERROR);
        }
    }catch(err){
        res.status(500).json(err.message);
    }
}

const registerUser = async (req, res) => {
    try{
        if(!userService.validateRequestBody(req.body)) throw new Error(INVALID_REQUEST_BODY_ERROR);
        
        req.body.password = await hashPassword(req.body.password);
        const user = await userService.createUser(req.body);

        res.status(200).json(user);
    }catch(err){
        res.status(500).json(err.message);
    }
}

module.exports = {
    userLogin,
    registerUser,
}