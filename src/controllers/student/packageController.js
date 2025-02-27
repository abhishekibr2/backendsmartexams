const Package = require("../../models/packageModel");
const ProductCheckouts = require("../../models/ProductCheckout")
const moment = require('moment');
const TestAttempt = require("../../models/TestAttempt");
const mongoose = require("mongoose");

const packageController = {
    freePackage: async (req, res) => {
        try {
            const freePackage = await Package
                .find({
                    isFree: 'yes',
                    isPublished: true,
                    isActive: 'yes',
                    qualityChecked: true
                })
                .limit(5)
                .sort({ _id: 'desc' })
                .populate('state grade examType')
                .populate({
                    path: 'tests',
                    populate: { path: 'subject grade state examType' }
                }).lean();

            if (freePackage.length > 0) {
                for (const test of freePackage) {
                    for (const item of test.tests) {
                        const testAttempt = await TestAttempt.findOne({
                            test: item._id,
                            user: new mongoose.Types.ObjectId(req.user.userId)
                        })
                            .sort({ createdAt: -1 })
                            .lean();

                        item.testAttempt = testAttempt;
                    }
                }
            }

            res.status(200).json({ success: true, data: freePackage });
        } catch (err) {
            console.error('Error in freePackage:', err);
            res.status(500).json({ success: false, message: 'Server Error' });
        }
    },

    getPackages: async (req, res) => {
        try {
            const { userId } = req.query;
            const currentDate = moment().toDate();

            const packages = await ProductCheckouts
                .find({
                    userId: userId,
                    "orderSummary.package.packageValidity.calculatedTime": { $gte: currentDate }
                })
                .populate({
                    path: 'orderSummary.package',
                    populate: {
                        path: 'packageId',
                        model: 'Package',
                        match: { hasEssay: 'yes' }, // Filter packages where hasEssay is 'yes'
                        populate: {
                            path: 'tests',
                            populate: {
                                path: 'subject grade state testConductedBy examType'
                            }
                        }
                    }
                });
            return res.status(200).json({ success: true, data: packages });
        } catch (err) {
            return res.status(500).json({ success: false, message: 'Server Error' });
        }
    },

    testWithPackage: async (req, res) => {
        try {
            const { packageId, testId } = req.query;
            const package = await Package
                .findOne({
                    _id: packageId,
                    tests: testId
                })
                .populate('state grade examType')
                .populate({
                    path: 'tests',
                    populate: { path: 'subject grade state examType' }
                });
            res.status(200).json(package);
        } catch (err) {
            console.error('Error in freePackage:', err);
            res.status(500).json({ success: false, message: 'Server Error' });
        }
    },
};

module.exports = packageController;
