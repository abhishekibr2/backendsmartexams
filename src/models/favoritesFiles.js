const mongoose = require('mongoose');

const favoriteFilesSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    files: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'FileManagerFile',
            required: true
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const FavoriteFiles = mongoose.model('favoriteFiles', favoriteFilesSchema);

module.exports = FavoriteFiles;
