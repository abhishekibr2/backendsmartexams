const emailPageModel = require('../../models/emailPageContent');

const emailController = {

    addUpdateEmailContent: async (req, res) => {
        try {
            const { description, editId } = req.body.data;

            if (editId) {
                // Update existing record
                const homePageData = await emailPageModel.findByIdAndUpdate(
                    editId,
                    { description },
                    { new: true } // Return the updated document
                );

                if (!homePageData) {
                    return res.status(404).json({
                        status: false,
                        message: 'Email Page content not found for the provided ID',
                    });
                }

                return res.status(200).json({
                    status: true,
                    data: homePageData,
                    message: 'Email Page Content updated successfully',
                });
            } else {
                // Check if a record already exists
                const existingData = await emailPageModel.findOne();
                if (existingData) {
                    return res.status(400).json({
                        status: false,
                        message: 'A record already exists. Please provide an editId to update it.',
                    });
                }

                // Create a new record if none exists
                const newData = await emailPageModel.create({ description });
                return res.status(201).json({
                    status: true,
                    data: newData,
                    message: 'Email Page Content added successfully',
                });
            }
        } catch (error) {
            console.error('Error in addUpdateEmailContent:', error);
            return res.status(500).json({
                status: false,
                message: 'An error occurred while adding or updating the email content',
            });
        }
    },

    getEmailContent: async (req, res) => {
        try {
            const emailPageContent = await emailPageModel.find().sort({ _id: -1 });
            res.status(200).json({ status: true, data: emailPageContent });
        } catch (error) {
            console.error('Error in getHomePageContent:', error);
            res.status(500).json({ status: false, message: 'Internal Server Error' });
        }
    },
}
module.exports = emailController
