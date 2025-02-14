const Test = require("../../models/test");

const testController = {
    getAllTests: async (req, res) => {
        try {
            const tests = await Test.find().populate('subject packageName testConductedBy state')
                .sort({
                    createdAt: -1,
                });

            return res.status(200).json({
                success: true,
                message: 'Tests retrieved successfully',
                data: tests,
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                success: false,
                message: 'An error occurred while retrieving the tests',
                error: error.message,
            });
        }
    },

    getTestsById: async (req, res) => {
        try {

            const { testUrl, duplicateTestId } = req.body;
            if (!testUrl && !duplicateTestId) {
                return res.status(400).json({
                    success: false,
                    message: 'Either testUrl or duplicateTestId is required'
                });
            }

            let test;

            if (testUrl) {
                test = await Test.findOne({ _id: testUrl });
            }

            if (!test && duplicateTestId) {
                test = await Test.findById(duplicateTestId);
            }

            if (!test) {
                return res.status(404).json({
                    success: false,
                    message: 'Test not found'
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Test retrieved successfully',
                data: test
            });

        } catch (error) {
            console.error('Error retrieving test:', error);

            return res.status(500).json({
                success: false,
                message: 'An error occurred while retrieving the test',
                error: error.message
            });
        }
    },

};

module.exports = testController;
