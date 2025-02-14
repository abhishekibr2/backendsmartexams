const FooterMenu = require('../../models/headerMenu')
const { getAdminDataByRole, trackUserActivity } = require('../../common/functions');
const errorLogger = require('../../../logger');

const footerMenuController = {
    getFooterMenus: async (req, res) => {
        try {
            const footerMenus = await FooterMenu.find();
            res.status(200).json({ status: true, data: footerMenus });
        } catch (error) {
            errorLogger(error);
            res.status(500).json({ status: false, message: 'Internal Server Error' });
        }
    },
    addUpdateFooterData: async (req, res) => {
        try {
            const { menuId, title, link, subMenu } = req.body;
            const footerData = { title, link, subMenu };
            let menu;

            if (menuId) {
                menu = await FooterMenu.findByIdAndUpdate(menuId, footerData, { new: true });
                if (!menu) {
                    return res.status(404).json({ status: false, message: 'Menu not found' });
                }
            } else {
                footerData.userId = req.body.userId;
                menu = new FooterMenu(footerData);
                await menu.save();
            }
            const adminId = await getAdminDataByRole('users');
            await trackUserActivity(adminId, 'Footer data updated by admin');
            res.status(200).json({ status: true, message: 'Footer data updated successfully', menu });
        } catch (error) {
            errorLogger(error);
            res.status(500).json({ status: false, message: 'Internal Server Error' });
        }
    },
}
module.exports = footerMenuController;
