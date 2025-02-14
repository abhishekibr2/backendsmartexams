const ebook = require('../../models/ebook');

const ebooksController = {
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
}
module.exports = ebooksController
