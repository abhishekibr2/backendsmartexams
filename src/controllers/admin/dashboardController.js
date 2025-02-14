const User = require('../../models/Users');
const Blog = require('../../models/Blog');
const test = require('../../models/test');
const ebook = require('../../models/ebook');
const Package = require('../../models/packageModel');
const Question = require('../../models/Question');
const testConductedBy = require('../../models/testConductedBy');
const testFeedback = require('../../models/testFeedback');
const questionFeedbackModel = require('../../models/questionFeedbackModel');
const packageFeedback = require('../../models/packageFeedback');
const productCheckouts = require('../../models/ProductCheckout');
const Subjects = require('../../models/subject')

const moment = require('moment');

const dashboardController = {

    getUserCountByMonthYear: async (req, res) => {
        try {
            const { month, year } = req.body;
            if (!year) {
                return res.status(400).json({ status: false, message: 'Year is required' });
            }
            const userCountData = [];
            // If month is not provided or set to 'All', fetch data for all months
            if (!month || month === 'All') {
                for (let month = 1; month <= 12; month++) {
                    const startDate = moment().year(year).month(month - 1).startOf('month');
                    const endDate = moment().year(year).month(month - 1).endOf('month');

                    const userCount = await User.countDocuments({
                        status: "active",
                        createdAt: { $gte: startDate.toDate(), $lte: endDate.toDate() }
                    });

                    userCountData.push({ month, count: userCount });
                }
            } else {
                // Fetch data for the specific month
                const startDate = moment().year(year).month(month - 1).startOf('month');
                const endDate = moment().year(year).month(month - 1).endOf('month');
                const userCount = await User.countDocuments({
                    status: "active",
                    createdAt: { $gte: startDate.toDate(), $lte: endDate.toDate() }
                });

                userCountData.push({ month, count: userCount });
            }
            res.status(200).json({ status: true, data: userCountData });
        } catch (error) {
            console.error(error);
            res.status(500).json({ status: false, message: 'Error fetching user count for the selected month and year' });
        }
    },

    dashboardCounts: async (req, res) => {
        try {
            const [userCount, blogCount, testCount, packageCount, questionsCount, testConductedByCount, packageFeedbackCount] = await Promise.all([
                User.countDocuments({ status: 'active' }),
                Blog.countDocuments({ status: 'active' }),
                test.countDocuments({ status: 'active' }),
                Package.countDocuments(),
                Question.countDocuments(),
                testConductedBy.countDocuments({ status: 'active' }),
                packageFeedback.countDocuments(),

            ]);
            const studentCount = await User.countDocuments({ role: 'student', status: 'active' });
            const questionFeedbackModelCount = await questionFeedbackModel.countDocuments();
            const testFeedbackCount = await testFeedback.countDocuments();
            const publishEbookCount = await ebook.countDocuments();
            const subjectsCount = await Subjects.countDocuments();
            const totalEbooksCount = await productCheckouts.aggregate([
                {
                    $match: { 'orderSummary.eBook': { $exists: true } }
                },
                {
                    $unwind: '$orderSummary.eBook'
                },
                {
                    $count: 'totalEbooks'
                }
            ]);
            const totalPackage = await productCheckouts.aggregate([
                {
                    $match: { 'orderSummary.package': { $exists: true } }
                },
                {
                    $unwind: '$orderSummary.package'
                },
                {
                    $group: {
                        _id: null,
                        totalPackagePrice: { $sum: '$orderSummary.package.packagePrice' }
                    }
                }
            ]);
            const PackageSold = totalPackage.length > 0 ? totalPackage[0].totalPackagePrice : 0;
            const counts = {
                users: userCount,
                blogs: blogCount,
                test: testCount,
                ebook: totalEbooksCount,
                publishEbookCount: publishEbookCount,
                package: packageCount,
                questions: questionsCount,
                testConductedBy: testConductedByCount,
                packageFeedback: packageFeedbackCount,
                questionFeedbackModel: questionFeedbackModelCount,
                student: studentCount,
                testFeedback: testFeedbackCount,
                PackageSold: PackageSold,
                subjectsCount: subjectsCount
            };
            res.status(200).json({ status: true, counts });
        } catch (error) {
            console.error(error);
            res.status(500).json({ status: false, message: 'Error fetching dashboard counts' });
        }
    }
};

module.exports = dashboardController;
