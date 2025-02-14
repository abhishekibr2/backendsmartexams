const ContactUs = require("../../models/ContactUs");
const User = require("../../models/Users");
const logError = require('../../../logger');

const contactUsController = {

    getContactUsData: async (req, res) => {
        try {
            const { userId } = req.params;
            const contactUs = await ContactUs.findOne({
                'messages.senderId': userId
            }).populate('messages.senderId', 'image name');

            const admin = await User.findOne({ role: 'admin' }, 'name email image');

            res.status(200).json({
                success: true,
                data: contactUs,
                admin
            });
        } catch (error) {
            logError(error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            })
        }
    },

    submitContactUsMessage: async (req, res) => {
        try {
            const { userId, message } = req.body;

            if (!userId || !message) {
                return res.status(400).json({
                    success: false,
                    message: 'User ID and message are required'
                });
            }

            let contactUs = await ContactUs.findOne({ createdBy: userId });

            if (!contactUs) {
                contactUs = new ContactUs({
                    createdBy: userId,
                    messages: [{ senderId: userId, message }],
                });

                await contactUs.save();

                return res.status(201).json({
                    success: true,
                    message: 'Message submitted successfully',
                    data: contactUs,
                });
            }

            contactUs.messages.push({ senderId: userId, message });
            await contactUs.save();

            return res.status(200).json({
                success: true,
                message: 'Message updated successfully',
                data: contactUs,
            });
        } catch (error) {
            logError('Error in submitContactUsMessage:', error);
            res.status(500).json({
                success: false,
                message: 'Server Error'
            });
        }
    },
};

module.exports = contactUsController;
