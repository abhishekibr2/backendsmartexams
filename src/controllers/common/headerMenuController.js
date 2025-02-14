const HeaderMenu = require('../../models/headerMenu')
const { getAdminDataByRole, trackUserActivity } = require('../../common/functions');
const errorLogger = require('../../../logger');

const headerMenuController = {
    addUpdateHeaderData: async (req, res) => {
        try {
            const { menuId, title, link, subMenu } = req.body;
            const headerData = { title, link, subMenu };
            let menu;

            if (menuId) {
                menu = await HeaderMenu.findByIdAndUpdate(menuId, headerData, { new: true });
                if (!menu) {
                    return res.status(404).json({ status: false, message: 'Menu not found' });
                }
            } else {
                headerData.userId = req.body.userId;
                menu = new HeaderMenu(headerData);
                await menu.save();
            }
            const adminId = await getAdminDataByRole('users');
            await trackUserActivity(adminId, 'Header data updated by admin');
            res.status(200).json({ status: true, message: 'Header data updated successfully', menu });
        } catch (error) {
            errorLogger(error);
            res.status(500).json({ status: false, message: 'Internal Server Error' });
        }
    },

    getHeaderMenus: async (req, res) => {
        try {
            const headerMenus = await HeaderMenu.find();
            res.status(200).json({ status: true, data: headerMenus });
        } catch (error) {
            errorLogger(error);
            res.status(500).json({ status: false, message: 'Internal Server Error' });
        }
    },
}
module.exports = headerMenuController;
