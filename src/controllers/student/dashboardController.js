const ProductCheckout = require("../../models/ProductCheckout");
const PackagesEssay = require('../../models/packageEssay');
// const Test = require('../../models/test');
const logError = require('../../../logger');
const Packages = require('../../models/packageModel')

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

            // const purchasedTests = await ProductCheckout.find({ userId: userId })
            //     .select('orderSummary.package.packageId')
            //     .lean();

            const freePackages = await Packages.find({ isFree: 'yes' })

            // const freePackagesId = freePackages
            //     .flatMap((item) => item.orderSummary.package || [])
            //     .map((pkg) => pkg.packageId);

            // const freeTests = await ProductCheckout.find({
            //     userId: userId,
            //     'orderSummary.package.packageId': { $in: freePackagesId }
            // });
            const packagesEssay = await PackagesEssay.find({ packageId: { $in: packagesIds } });
            const totalPurchasedEbooks = purchasedBooks.reduce((count, item) => {
                // console.log(item.orderSummary.eBook, 'item.orderSummary.eBook.length')
                return count + (item.orderSummary.eBook.length || 0);
            }, 0);
            const totalPurchasedPackages = purchasedPackages.reduce((count, item) => {
                return count + (item.orderSummary.package.length || 0);
            }, 0);
            const totalPurchasedTests = totalPurchasedPackages;
            const totalTest = totalPurchasedPackages + freePackages.length
            const totalFreeTests = freePackages.length;
            const totalFreePackages = freePackages.length;
            const totalPackagesEssay = packagesEssay.length;

            res.status(200).json({
                status: true,
                data: {
                    totalTest,
                    totalPurchasedEbooks,
                    totalPurchasedPackages,
                    totalPurchasedTests,
                    totalFreePackages,
                    totalFreeTests,
                    totalPackagesEssay
                },
            });
        } catch (error) {
            logError('Error in getUserDashboardData:', error);
            res.status(500).json({ success: false, message: 'Server Error' });
        }
    },
};

module.exports = dashboardController;
