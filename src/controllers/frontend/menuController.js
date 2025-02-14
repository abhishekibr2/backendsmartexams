const HeaderMenu = require('../../models/headerMenu');
const errorLogger = require('../../../logger');

const blogController = {
    getHeaderMenus: async (req, res) => {
        try {
            const headerMenus = await HeaderMenu.find().sort({ order: 1 });
            res.status(200).json({ status: true, data: headerMenus });
        } catch (error) {
            errorLogger(error);
            res.status(500).json({ status: false, message: 'Internal Server Error' });
        }
    }
};

module.exports = blogController;
