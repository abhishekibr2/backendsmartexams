const eBook = require('../../models/ebook');
const { createUpload } = require('../../utils/multerConfig');
const errorLogger = require('../../../logger');

const eBookController = {
    addUpdateEBook: async (req, res) => {
        try {
            const upload = createUpload('E-bookss');
            const uploadFields = upload.fields([
                { name: 'pdfFile', maxCount: 1 },
                { name: 'image', maxCount: 1 }
            ]);

            uploadFields(req, res, async (err) => {
                if (err) {
                    errorLogger('Error uploading files:', err);
                    return res.status(500).json({ message: 'Error uploading files', status: false });
                }

                const {
                    title,
                    slug,
                    examTypeId,
                    gradeId,
                    description,
                    subjectId,
                    authorText,
                    price,
                    discount,
                    stateId,
                    is_featured,
                    status,
                    EBook_id,
                    updatedBy,
                    imageSize,
                    isFree
                } = req.body;

                // eslint-disable-next-line security/detect-object-injection
                const processFile = (fileKey) => req.files[fileKey] ? req.files[fileKey][0].filename : req.body[fileKey];
                const generateRandomSuffix = () => Math.floor(100 + Math.random() * 900);

                const checkAndModifySlug = async (slug, EBook_id) => {
                    let finalSlug = slug;
                    if (!EBook_id) {
                        const existingEBook = await eBook.findOne({ slug: finalSlug });
                        if (existingEBook) {
                            finalSlug = `${slug}-${generateRandomSuffix()}`;
                        }
                    } else {
                        const existingEBook = await eBook.findOne({ slug: finalSlug });
                        if (existingEBook && existingEBook._id.toString() !== EBook_id) {
                            finalSlug = `${slug}-${generateRandomSuffix()}`;
                        }
                    }
                    return finalSlug;
                };
                const modifiedSlug = await checkAndModifySlug(slug, EBook_id);
                // Calculate discounted price
                let parsedPrice = parseFloat(price) || 0;
                let parsedDiscount = parseFloat(discount) || 0;
                const discountedPrice = parsedPrice - (parsedPrice * parsedDiscount / 100);
                if (isFree === 'yes') {
                    parsedPrice = 0;
                    parsedDiscount = 0;
                }

                const eBookData = {
                    pdfFile: processFile('pdfFile'),
                    image: processFile('image'),
                    title,
                    slug: modifiedSlug,
                    examTypeId: examTypeId ? examTypeId.toString() : null,
                    gradeId: gradeId ? gradeId.toString() : null,
                    description,
                    subjectId,
                    authorText,
                    price: parsedPrice.toFixed(2),
                    discount: parsedDiscount.toFixed(2),
                    discountedPrice: discountedPrice.toFixed(2),
                    stateId: stateId ? stateId.toString() : null,
                    is_featured,
                    status,
                    createdBy: updatedBy,
                    updatedBy,
                    imageSize,
                    isFree
                };

                try {
                    if (!EBook_id) {
                        const newEBook = new eBook(eBookData);
                        await newEBook.save();
                        return res.status(201).json({
                            message: 'EBook added successfully!',
                            product: newEBook
                        });
                    }

                    const updatedEBook = await eBook.findByIdAndUpdate(EBook_id, eBookData, { new: true });
                    if (!updatedEBook) {
                        return res.status(404).json({ message: 'EBook not found' });
                    }

                    return res.status(200).json({
                        message: 'EBook updated successfully!',
                        product: updatedEBook
                    });
                } catch (error) {
                    errorLogger(error);
                    return res.status(500).json({
                        message: 'An error occurred while processing the request.',
                        error: error.message
                    });
                }
            });
        } catch (error) {
            errorLogger(error);
            return res.status(500).json({
                message: 'An unexpected error occurred.',
                error: error.message
            });
        }
    },

    getAllEBooks: async (req, res) => {
        try {
            const eBooks = await eBook.find().populate('examTypeId').populate('stateId').populate('gradeId').populate('subjectId');
            res.status(200).json({ eBooks });
        } catch (error) {
            errorLogger(error);
            res.status(500).json({
                message: 'An error occurred while processing the request.',
                error: error.message,
            });
        }
    },
    deleteEbook: async (req, res) => {
        try {
            const { id } = req.body;
            if (!id) {
                return res.status(400).json({ message: 'eBook ID is required.' });
            }
            const eBooks = await eBook.findByIdAndDelete({ _id: id });
            if (!eBooks) {
                return res.status(404).json({ message: 'eBook not found.' });
            }
            res.status(200).json({ message: 'eBook deleted successfully.' });
        } catch (error) {
            errorLogger(error);

            res.status(500).json({
                message: 'An error occurred while processing the request.',
                error: error.message,
            });
        }
    },
    getAllFreeEBooks: async (req, res) => {
        try {
            const eBooks = await eBook.find({ isFree: 'yes' }).populate('examTypeId').populate('stateId').populate('gradeId').populate('subjectId');
            res.status(200).json({ eBooks });
        } catch (error) {
            errorLogger(error);
            res.status(500).json({
                message: 'An error occurred while processing the request.',
                error: error.message,
            });
        }
    },

}

module.exports = eBookController
