const Ebook = require('../../models/ebook');
const State = require('../../models/State');
const ExamType = require('../../models/examType');
const ProductCheckout = require('../../models/ProductCheckout');
const logError = require('../../../logger');

const ebooksController = {
    getEbooksForStudent: async (req, res) => {
        try {
            const { stateId, examTypeId, filterPrice, perPage, purchaseType, userId } = req.query;
            const searchFilter = {};
            if (stateId && stateId !== 'undefined' && stateId !== '' && stateId !== 'all') {
                searchFilter.stateId = stateId;
            }
            if (examTypeId && examTypeId !== 'undefined' && examTypeId !== '') {
                searchFilter.examTypeId = examTypeId;
            }
            if (purchaseType && purchaseType !== 'undefined' && purchaseType !== '') {
                if (purchaseType === 'free') {
                    searchFilter.isFree = 'yes';
                } else if (purchaseType === 'paid') {
                    searchFilter.isFree = 'no';
                } else if (purchaseType === 'purchased') {
                    const purchasedBooks = await ProductCheckout.find({ userId: userId })
                        .select('orderSummary.eBook')
                        .lean();

                    const eBookIds = purchasedBooks
                        .flatMap((book) => book.orderSummary.eBook)
                        .map((ebook) => ebook.eBookId);

                    if (eBookIds.length > 0) {
                        searchFilter._id = { $in: eBookIds };
                    } else {
                        searchFilter._id = { $in: [] };
                    }
                }

            }
            let sortOrder = {};
            if (filterPrice && filterPrice !== 'undefined' && filterPrice !== '') {
                if (filterPrice === 'lowToHigh') {
                    sortOrder = { discountedPrice: 1 };
                } else if (filterPrice === 'highToLow') {
                    sortOrder = { discountedPrice: -1 };
                }
            }

            const ebooks = await Ebook.find(searchFilter)
                .select('image title price discount discountedPrice isFree pdfFile')
                .limit(perPage !== 'all' ? perPage : '')
                .lean();

            const processedEbooks = ebooks.map(ebook => ({
                ...ebook,
                price: parseFloat(ebook.price),
                discountedPrice: parseFloat(ebook.discountedPrice),
            }));

            if (sortOrder && Object.keys(sortOrder).length > 0) {
                processedEbooks.sort((a, b) => {
                    if (sortOrder.discountedPrice === 1) {
                        return a.discountedPrice - b.discountedPrice;
                    } else if (sortOrder.discountedPrice === -1) {
                        return b.discountedPrice - a.discountedPrice;
                    }
                    return 0;
                });
            }
            res.status(200).json({ status: true, data: processedEbooks });
        } catch (error) {
            logError('Error fetching ebooks:', error);
            res.status(500).json({ status: false, message: 'Internal Server Error' });
        }
    },

    singleEbook: async (req, res) => {
        try {
            const id = req.params.id;
            const singleBlog = await Ebook.findOne({ _id: id }).populate('stateId', 'title');
            const randomBooks = await Ebook.aggregate([{ $sample: { size: 6 } }]);
            if (!singleBlog) {
                return res.status(404).json({ status: false, message: 'ebook not found' });
            }
            res.status(200).json({ status: true, data: singleBlog, randomBooks: randomBooks });
        } catch (error) {
            logError(error);
            res.status(500).json({ status: false, message: 'Internal Server Error' });
        }
    },

    getAllStatesForFilter: async (req, res) => {
        try {
            const states = await State.find().select('title');
            res.status(200).json({ status: true, data: states });
        } catch (error) {
            logError(error);
            res.status(500).json({ status: false, message: 'Internal Server Error' });
        }
    },

    getAllExamTypeForFilter: async (req, res) => {
        try {
            const examTypes = await ExamType.find().select('examType stateId');
            res.status(200).json({ status: true, data: examTypes });
        } catch (error) {
            logError(error);
            res.status(500).json({ status: false, message: 'Internal Server Error' });
        }
    },
    getAllEBooks: async (req, res) => {
        try {
            const userId = req.params.userId;
            console.log(userId, 'here user Id ')
            const purchasedBooks = await ProductCheckout.find({ userId: userId })
                .select('orderSummary.eBook')
            const eBookIds = purchasedBooks
                .flatMap((book) => book.orderSummary.eBook)
                .map((ebook) => ebook.eBookId);
            const eBooks = await Ebook.find({ $or: [{ isFree: 'yes' }, { _id: { $in: eBookIds } }] }).populate('examTypeId').populate('stateId').populate('gradeId').populate('subjectId');
            res.status(200).json({ eBooks });
        } catch (error) {
            logError(error);
            res.status(500).json({
                message: 'An error occurred while processing the request.',
                error: error.message,
            });
        }
    },
}
module.exports = ebooksController
