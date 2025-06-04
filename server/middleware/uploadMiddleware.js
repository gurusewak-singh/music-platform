// server/middleware/uploadMiddleware.js
const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage();

function checkFileType(file, cb, allowedTypesRegex) {
    const extname = allowedTypesRegex.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypesRegex.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Invalid file type.'));
    }
}

const audioFiletypes = /mpeg|mp3|wav|aac|ogg/;
const imageFiletypes = /jpeg|jpg|png|gif/;

const songUpload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 25 }, // 25MB for audio
    fileFilter: function (req, file, cb) {
        if (file.fieldname === "audioFile") {
            checkFileType(file, cb, audioFiletypes);
        } else if (file.fieldname === "coverArtFile") {
            checkFileType(file, cb, imageFiletypes);
        } else {
            cb(new Error('Unexpected field'));
        }
    }
});

const singleImageUpload = multer({ // For playlist covers, profile pictures etc.
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 }, // 5MB for images
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb, imageFiletypes);
    }
});


const songUploadFields = songUpload.fields([
    { name: 'audioFile', maxCount: 1 },
    { name: 'coverArtFile', maxCount: 1 }
]);

module.exports = {
    songUploadFields,
    singleImageUpload // Export this for playlist covers
};