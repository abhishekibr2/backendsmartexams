const ProductCheckout = require('../../models/ProductCheckout');
const Packages = require('../../models/packageModel');
const Ebook = require('../../models/ebook');
const logError = require('../../../logger');

const allOrdersController = {
    getAllPackagesForFilter: async (req, res) => {
        try {
            const allPackages = await Packages.find().select('packageName');
            res.status(200).json({ status: true, data: allPackages });
        } catch (error) {
            logError(error);
            res.status(500).json({ status: false, message: 'Internal Server Error' });
        }
    },

    getAllEbookForFilter: async (req, res) => {
        try {
            const allEbooks = await Ebook.find().select('title');
            res.status(200).json({ status: true, data: allEbooks });
        } catch (error) {
            logError(error);
            res.status(500).json({ status: false, message: 'Internal Server Error' });
        }
    },

    getAllEbookOrders: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;
            const ebookFilterId = req.query.ebookFilterId;
            const searchQuery = req.query.searchQuery || '';

            const andConditions = [];

            if (searchQuery) {
                andConditions.push({
                    $or: [
                        { firstName: { $regex: searchQuery, $options: 'i' } },
                        { lastName: { $regex: searchQuery, $options: 'i' } },
                        { email: { $regex: searchQuery, $options: 'i' } },
                        { phone: { $regex: searchQuery, $options: 'i' } },
                        { 'orderSummary.eBook.eBookTitle': { $regex: searchQuery, $options: 'i' } },
                    ]
                })
            }

            if (ebookFilterId && ebookFilterId !== 'undefined') {
                andConditions.push({ 'orderSummary.eBook.eBookId': ebookFilterId });
            }

            const searchFilter = andConditions.length > 0 ? { $and: andConditions } : {};

            const eBookOrders = await ProductCheckout.find(
                searchFilter,
                {
                    firstName: 1,
                    lastName: 1,
                    country: 1,
                    streetAddress1: 1,
                    streetAddress2: 1,
                    townCity: 1,
                    state: 1,
                    zipCode: 1,
                    phone: 1,
                    email: 1,
                    createdAt: 1,
                    'orderSummary.eBook': 1,
                    'orderSummary.subTotal': 1,
                    'orderSummary.tax': 1,
                    'orderSummary.totalAmount': 1,
                    'orderSummary.paymentMethod': 1,
                    'orderSummary.paymentStatus': 1,
                    userId: 1,
                }
            )
                .skip(skip)
                .limit(limit)
                .populate('userId', 'name lastName email image')
                .sort({ _id: -1 });

            const filteredOrders = eBookOrders.filter(order => order.orderSummary.eBook && order.orderSummary.eBook.length > 0);

            const totalCount = await ProductCheckout.countDocuments(searchFilter);

            res.status(200).json({ status: true, data: filteredOrders, totalCount });
        } catch (error) {
            logError(error);
            res.status(500).json({ error: 'Error fetching eBook data' });
        }
    },

    getAllPackageOrders: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const searchQuery = req.query.searchQuery || '';
            const packageFilterId = req.query.packageFilterId;
            const skip = (page - 1) * limit;

            const andConditions = [];

            if (searchQuery) {
                andConditions.push({
                    $or: [
                        { firstName: { $regex: searchQuery, $options: 'i' } },
                        { lastName: { $regex: searchQuery, $options: 'i' } },
                        { email: { $regex: searchQuery, $options: 'i' } },
                        { phone: { $regex: searchQuery, $options: 'i' } },
                        { 'orderSummary.package.packageName': { $regex: searchQuery, $options: 'i' } },
                    ],
                });
            }

            if (packageFilterId && packageFilterId !== 'undefined') {
                andConditions.push({ 'orderSummary.package.packageId': packageFilterId });
            }

            const searchFilter = andConditions.length > 0 ? { $and: andConditions } : {};

            const orders = await ProductCheckout.find(
                searchFilter,
                {
                    firstName: 1,
                    lastName: 1,
                    country: 1,
                    streetAddress1: 1,
                    streetAddress2: 1,
                    townCity: 1,
                    state: 1,
                    zipCode: 1,
                    phone: 1,
                    email: 1,
                    createdAt: 1,
                    'orderSummary.package': 1,
                    'orderSummary.subTotal': 1,
                    'orderSummary.tax': 1,
                    'orderSummary.totalAmount': 1,
                    'orderSummary.paymentMethod': 1,
                    'orderSummary.paymentStatus': 1,
                    userId: 1,
                }
            )
                .skip(skip)
                .limit(limit)
                .populate('userId', 'name lastName email image')
                .sort({ _id: -1 });

            const filteredOrders = orders.filter(
                (order) => order.orderSummary.package && order.orderSummary.package.length > 0
            );

            const totalCount = await ProductCheckout.countDocuments(searchFilter);

            res.status(200).json({ status: true, data: filteredOrders, totalCount });
        } catch (error) {
            logError(error);
            res.status(500).json({ error: 'Error fetching package data' });
        }
    }

};

module.exports = allOrdersController;
