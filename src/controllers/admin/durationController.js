const Duration = require("../../models/Duration");
const Package = require("../../models/packageModel")
// const Test = require("../../models/test")
const logError = require('../../../logger');

const durationController = {
    addDuration: async (req, res) => {
        try {
            const { duration, createdBy, updateId, durationOption } = req.body || {};

            if (!duration || !createdBy || !durationOption) {
                return res.status(400).json({
                    status: false,
                    message: "Missing required fields: 'duration', 'createdBy', and 'durationOption'",
                });
            }

            // Validate duration and durationOption
            const durationInt = parseInt(duration, 10);
            if (isNaN(durationInt) || durationInt <= 0) {
                return res.status(400).json({
                    status: false,
                    message: "Invalid 'duration' value. It must be a positive number.",
                });
            }

            const validOptions = ['days', 'weeks', 'months', 'years'];
            if (!validOptions.includes(durationOption.toLowerCase())) {
                return res.status(400).json({
                    status: false,
                    message: `Invalid 'durationOption'. It must be one of ${validOptions.join(', ')}.`,
                });
            }

            const DurationTime = `${durationInt} ${durationOption.charAt(0).toUpperCase() + durationOption.slice(1)}`;

            const now = new Date();
            let calculatedTime;

            switch (durationOption.toLowerCase()) {
                case 'days':
                    calculatedTime = new Date(now.setDate(now.getDate() + durationInt));
                    break;
                case 'weeks':
                    calculatedTime = new Date(now.setDate(now.getDate() + durationInt * 7));
                    break;
                case 'months':
                    calculatedTime = new Date(now.setMonth(now.getMonth() + durationInt));
                    break;
                case 'years':
                    calculatedTime = new Date(now.setFullYear(now.getFullYear() + durationInt));
                    break;
            }

            if (updateId) {
                const existingDuration = await Duration.findByIdAndUpdate(
                    updateId,
                    {
                        DurationTime,
                        calculatedTime,
                        durationOption: durationOption,
                        updatedBy: createdBy,
                        updatedAt: new Date(),
                    },
                    { new: true }
                );

                if (!existingDuration) {
                    return res.status(404).json({ status: false, message: 'Duration not found' });
                }

                return res.status(200).json({ status: true, data: existingDuration, message: 'Duration updated successfully' });
            }

            const newDuration = new Duration({
                DurationTime,
                durationOption,
                calculatedTime,
                createdBy,
            });

            const savedDuration = await newDuration.save();

            res.status(201).json({
                status: true,
                message: "Duration added successfully",
                data: savedDuration,
            });
        } catch (error) {
            logError("Error adding duration:", error.message);
            res.status(400).json({
                status: false,
                message: error.message,
            });
        }

    },

    getDuration: async (req, res) => {
        try {

            const duration = await Duration.find().sort({ createdAt: -1 });
            res.status(200).json({ status: true, data: duration })

        } catch (error) {
            logError("Error getting duration:", error.message);
            res.status(400).json({ status: false, message: error.message })

        }
    },
    deleteDuration: async (req, res) => {
        try {
            const durationIds = req.body.data;

            if (!Array.isArray(durationIds) || durationIds.length === 0) {
                return res.status(400).json({
                    status: false,
                    message: "Invalid input. 'data' must be a non-empty array of duration IDs.",
                });
            }

            // Step 1: Check if any of the durations are assigned in Package or Test
            const isAssignedInPackage = await Package.find({ packageDuration: { $in: durationIds } });

            // If any duration is assigned, prevent deletion
            let errorMessage = 'Duration cannot be deleted as it is assigned to:';
            const assignments = [];

            if (isAssignedInPackage.length) {
                assignments.push('Package');
            }
            if (assignments.length) {
                return res.status(400).json({
                    status: false,
                    message: `${errorMessage} ${assignments.join(', ')}.`,
                });
            }

            // Step 2: Delete all durations that are not assigned
            const deletedDurations = await Duration.deleteMany({ _id: { $in: durationIds } });

            if (deletedDurations.deletedCount === 0) {
                return res.status(404).json({
                    status: false,
                    message: "No durations were found to delete.",
                });
            }

            res.status(200).json({
                status: true,
                message: `${deletedDurations.deletedCount} Duration(s) deleted successfully.`,
            });

        } catch (error) {
            console.error("Error deleting duration:", error.message);
            res.status(400).json({
                status: false,
                message: error.message,
            });
        }
    }


}

module.exports = durationController;
