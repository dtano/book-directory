const bcrypt = require('bcrypt');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if(token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if(err) res.sendStatus(403);

        req.user = user;
        next();
    });
}

const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    return hashedPassword;
}

const compareHash = async (plainPassword, hashedPassword) => {
    const arePasswordsEqual = await bcrypt.compare(plainPassword, hashedPassword);
    return arePasswordsEqual;
}

module.exports = {
    authenticateToken,
    hashPassword,
    compareHash,
}