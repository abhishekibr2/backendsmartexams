const ebook = require('../../models/ebook');

const ebookController = {
    allEbook: async (req, res) => {
        try {
            const activeAndLatestBlogs = await ebook.find({ status: 'active' })
                .sort({ createdAt: -1 })

            res.status(200).json({ status: true, data: activeAndLatestBlogs });
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: false, message: 'Internal Server Error' });
        }
    },

    singleEbook: async (req, res) => {
        try {
            const slug = req.params.slug;
            const singleBlog = await ebook.findOne({ slug: slug }).populate('stateId', 'title')
                .populate('examTypeId', 'examType');
            const randomBooks = await ebook.aggregate([{ $sample: { size: 6 } }]);
            if (!singleBlog) {
                return res.status(404).json({ status: false, message: 'ebook not found' });
            }
            res.status(200).json({ status: true, data: singleBlog, randomBooks: randomBooks });
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: false, message: 'Internal Server Error' });
        }
    },
}
module.exports = ebookController
