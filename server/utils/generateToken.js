// server/utils/generateToken.js
const jwt = require('jsonwebtoken');

const generateToken = (id, role, isVerifiedArtist) => {
    return jwt.sign({ id, role, isVerifiedArtist }, process.env.JWT_SECRET, {
        expiresIn: '30d', // Token expires in 30 days
    });
};

module.exports = generateToken;