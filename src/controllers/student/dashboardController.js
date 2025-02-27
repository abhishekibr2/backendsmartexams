const ProductCheckout = require("../../models/ProductCheckout");
const PackagesEssay = require('../../models/packageEssay');
// const Test = require('../../models/test');
const logError = require('../../../logger');
const Packages = require('../../models/packageModel');
const Test = require('../../models/test');
const TestAttempt = require('../../models/TestAttempt');


const dashboardController = {
    getUserDashboardData: async (req, res) => {
        try {
            const { userId } = req.params;

            const purchasedBooks = await ProductCheckout.find({ userId: userId })
                .select('orderSummary.eBook.eBookId')
                .lean();

            const purchasedPackages = await ProductCheckout.find({ userId: userId })
                .select('orderSummary.package.packageId')
                .lean();

            const packagesIds = purchasedPackages
                .flatMap((item) => item.orderSummary.package || [])
                .map((pkg) => pkg.packageId);


            // Get all purchased packages and test count
            const purchasedTests = await Packages.find({ _id: { $in: packagesIds } });
            const totalPurchasedTestCount = purchasedTests.reduce((count, pkg) => {
                return count + (Array.isArray(pkg.tests) ? pkg.tests.length : 0);
            }, 0);

            // Get all Free packages and test count
            const freePackages = await Packages.find({ isFree: 'yes' })
            const totalFreePackageTests = freePackages.reduce((count, pkg) =>
                count + (Array.isArray(pkg.tests) ? pkg.tests.length : 0),
                0
            );

            // Purchase tests total duration
            const purchasedTestIds = purchasedTests.flatMap(pkg => Array.isArray(pkg.tests) ? pkg.tests : []);
            const purchasedTestDetails = await Test.find({ _id: { $in: purchasedTestIds } });
            const totalPurchasedTestDuration = purchasedTestDetails.reduce((totalDuration, test) =>
                totalDuration + (test.duration || 0),
                0
            );

            // Free tests total duration
            const testIds = freePackages.flatMap(pkg => Array.isArray(pkg.tests) ? pkg.tests : []);
            const freeTests = await Test.find({ _id: { $in: testIds } });
            const totalFreeTestsDuration = freeTests.reduce((totalDuration, test) =>
                totalDuration + (test.duration || 0),
                0
            );


            const completedTestCount = await TestAttempt.distinct("test", {
                user: userId,
                isCompleted: true
            });


            // Get the count of completed tests by the user
            const completedTestAttempts = await TestAttempt.find({
                user: userId,
                isCompleted: true
            })
                .select('timeTaken attemptQuestions')
                .populate('attemptQuestions');


            const testAttempts = await TestAttempt
                .find({
                    user: userId,
                    isCompleted: true
                })
                .sort({ createdAt: -1 })
                .select('attemptQuestions test createdAt')
                .populate({
                    path: 'test',
                    select: 'testName maxQuestions'
                })
                .populate('attemptQuestions');

            const uniqueTestAttempts = [];
            const seenTests = new Set();

            for (const attempt of testAttempts) {
                if (!seenTests.has(attempt.test._id.toString())) {
                    seenTests.add(attempt.test._id.toString());
                    uniqueTestAttempts.push(attempt);
                }
            }

            const categorizeScores = (uniqueTestAttempts) => {
                const categories = {
                    strength: [],
                    opportunity: [],
                    weakness: [],
                    risk: []
                };

                uniqueTestAttempts.forEach((attempt) => {
                    const totalQuestions = attempt.test.maxQuestions;
                    const correctAnswers = attempt.attemptQuestions.filter(q => q.isCorrect).length;
                    const scorePercentage = ((correctAnswers / totalQuestions) * 100).toFixed(2);

                    if (scorePercentage >= 85) {
                        categories.strength.push({ test: attempt.test, score: scorePercentage });
                    } else if (scorePercentage >= 75) {
                        categories.opportunity.push({ test: attempt.test, score: scorePercentage });
                    } else if (scorePercentage >= 50) {
                        categories.weakness.push({ test: attempt.test, score: scorePercentage });
                    } else {
                        categories.risk.push({ test: attempt.test, score: scorePercentage });
                    }
                });

                return categories;
            };

            const categorizedResults = categorizeScores(uniqueTestAttempts);

            const totalTimeSpentMinutes = completedTestAttempts.reduce((totalTime, attempt) =>
                totalTime + (attempt.timeTaken || 0),
                0
            );

            const packagesEssay = await PackagesEssay.find({ packageId: { $in: packagesIds } });
            const totalPurchasedEbooks = purchasedBooks.reduce((count, item) => {
                return count + (item.orderSummary.eBook.length || 0);
            }, 0);
            const totalPurchasedPackages = purchasedPackages.reduce((count, item) => {
                return count + (item.orderSummary.package.length || 0);
            }, 0);
            const totalPurchasedTests = totalPurchasedTestCount;
            const totalTest = totalPurchasedTestCount + totalFreePackageTests
            const totalFreeTests = totalFreePackageTests;
            const totalFreePackages = freePackages.length;
            const totalPackagesEssay = packagesEssay.length;
            const totalTestDurationMinutes = totalPurchasedTestDuration + totalFreeTestsDuration;
            const totalTestDurationHours = (totalTestDurationMinutes / 60).toFixed(2);
            const totalTimeSpentHours = (totalTimeSpentMinutes / 60).toFixed(2);



            res.status(200).json({
                status: true,
                data: {
                    totalTest,
                    totalPurchasedEbooks,
                    totalPurchasedPackages,
                    totalPurchasedTests,
                    totalFreePackages,
                    totalFreeTests,
                    totalPackagesEssay,
                    totalTestDurationHours,
                    completedTestCount: completedTestCount.length,
                    totalTimeSpentHours,
                    categorizedResults,
                    uniqueTestAttempts
                },
            });
        } catch (error) {
            logError('Error in getUserDashboardData:', error);
            res.status(500).json({ success: false, message: 'Server Error' });
        }
    },
};

module.exports = dashboardController;
