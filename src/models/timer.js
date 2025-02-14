const mongoose = require('mongoose');

const timerSchema = new mongoose.Schema({
    totalTime: { type: Number, default: null },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', default: null },
    startTime: { type: Date, default: null },
    elapsedTime: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users', default: null, index: null },
});

const timer = mongoose.model('timer', timerSchema);

module.exports = timer;
