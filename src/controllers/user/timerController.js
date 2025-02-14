const timer = require('../../models/timer'); // Import the timer model

// Controller for adding or updating timer details
const timerController = {
    updateTimer: async (req, res) => {
        try {

            const {
                currentTime,
                elapsedTime, // in seconds
                userId,
            } = req.body.data;


            const totalTime = Math.floor(elapsedTime / 60);

            const timerRecord = await timer.findOne({ userId });

            if (timerRecord) {

                timerRecord.currentTime = currentTime;
                timerRecord.elapsedTime = elapsedTime;
                timerRecord.totalTime = totalTime; // Update totalTime
                await timerRecord.save();

                res.status(200).json({
                    success: true,
                    message: 'Timer updated successfully',
                    data: timerRecord,
                });
            } else {
                // If no record found, create a new timer
                const newTimer = new timer({
                    currentTime,
                    elapsedTime,
                    totalTime,
                    userId,
                });

                const savedTimer = await newTimer.save();
                res.status(201).json({
                    success: true,
                    message: 'New Timer created successfully',
                    data: savedTimer,
                });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message,
            });
        }
    },

    getTimer: async (req, res) => {
        try {
            const { userId } = req.body.data;
            console.log(userId, 'userId')

            const timerRecord = await timer.findOne({ userId });
            console.log(timerRecord, 'timerRecord')


            if (timerRecord) {
                res.status(200).json({
                    success: true,
                    message: 'Timer retrieved successfully',
                    data: timerRecord,
                });
            } else {
                res.status(404).json({
                    success: false,
                    message: 'No timer found for this user',
                });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message,
            });
        }
    }



};



module.exports = timerController;
