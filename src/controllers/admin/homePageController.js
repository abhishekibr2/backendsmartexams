const homePageModel = require('../../models/HomepageContent');
const { createUpload } = require('../../utils/multerConfig');
// eslint-disable-next-line import/no-extraneous-dependencies
const moment = require('moment-timezone');
const { promisify } = require('util');
const path = require('path');
const fs = require('fs');
const unlinkAsync = promisify(fs.unlink);

const homePageController = {

    addUpdateHomePage: async (req, res) => {
        const upload = createUpload('bannerImages');
        upload.single('image')(req, res, async (err) => {
            if (err) {
                return res.status(500).json({ message: 'Error uploading file', status: false });
            }

            try {
                const { heading, startTime, endTime, couponCode, discount, bannerDescription, description, editId, secondHeading } = req.body;
                // Convert startTime and endTime to India Standard Time (IST)
                const startTimeIST = moment.tz(startTime, "Asia/Kolkata").toISOString();
                const endTimeIST = moment.tz(endTime, "Asia/Kolkata").toISOString();
                const image = req.file ? req.file.filename : null;

                const homePageData = {
                    heading,
                    startTime: startTimeIST,
                    endTime: endTimeIST,
                    couponCode,
                    discount,
                    bannerDescription,
                    description,
                    image: image,
                    secondHeading,

                };

                let data;

                if (editId) {
                    data = await homePageModel.findByIdAndUpdate(editId, homePageData, { new: true });

                    if (!data) {
                        return res.status(404).json({ message: 'HomePage content not found for the provided ID', status: false });
                    }
                    if (!req.file) {
                        homePageData.image = data.image;
                    }
                    res.status(200).json({
                        status: true,
                        message: 'HomePage Content updated successfully',
                        data,
                    });
                } else {
                    // Create new record if editId is not provided
                    data = await homePageModel.create(homePageData);
                    res.status(201).json({
                        status: true,
                        message: 'HomePage Content added successfully',
                        data,
                    });
                }
            } catch (error) {
                console.log(error, 'fg')
                res.status(500).json({ message: error.message, status: false });
            }
        });
    },

    getHomePageContent: async (req, res) => {
        try {
            const homePageContent = await homePageModel.find().sort({ _id: -1 });

            res.status(200).json({ status: true, data: homePageContent });
        } catch (error) {
            console.error('Error in getHomePageContent:', error);
            res.status(500).json({ status: false, message: 'Internal Server Error' });
        }
    },

    addFrontendHomePageContent: async (req, res) => {
        const upload = createUpload('homeImages');

        upload.fields([{ name: 'imageOne', maxCount: 1 },
        { name: 'sectionTwoImageOne', maxCount: 1 },
        { name: 'sectionTwoImageTwo', maxCount: 1 },
        { name: 'sectionTwoImageThree', maxCount: 1 },
        { name: 'sectionTwoImageFour', maxCount: 1 },
        { name: 'sectionTwoImageFive', maxCount: 1 },
        { name: 'sectionTwoImageSix', maxCount: 1 },
        ])(req, res, async (err) => {
            if (err) {
                console.error('Upload error:', err);
                return res.status(500).json({ message: 'Error uploading files', status: false });
            }

            try {
                const {
                    headingOne, buttonOne, descriptionOne,
                    editId,
                    headingTwo, subHeadingTwo,
                    sectionTwoTitleOne, sectionTwoTitleTwo, sectionTwoTitleThree, sectionTwoTitleFour, sectionTwoTitleFive, sectionTwoTitleSix,
                    headingThree, subHeadingThree, descriptionThree, stateHeading,
                    headingFour, descriptionFour, cardTextOne, cardTextTwo, cardTextThree, cardTextFour,
                    cardCountOne, cardCountTwo, cardCountThree, cardCountFour
                } = req.body;

                // Handle images
                const imageOne = req.files && req.files['imageOne'] ? req.files['imageOne'][0].filename : null;
                const sectionTwoImageOne = req.files && req.files['sectionTwoImageOne'] ? req.files['sectionTwoImageOne'][0].filename : null;
                const sectionTwoImageTwo = req.files && req.files['sectionTwoImageTwo'] ? req.files['sectionTwoImageTwo'][0].filename : null;
                const sectionTwoImageThree = req.files && req.files['sectionTwoImageThree'] ? req.files['sectionTwoImageThree'][0].filename : null;
                const sectionTwoImageFour = req.files && req.files['sectionTwoImageFour'] ? req.files['sectionTwoImageFour'][0].filename : null;
                const sectionTwoImageFive = req.files && req.files['sectionTwoImageFive'] ? req.files['sectionTwoImageFive'][0].filename : null;
                const sectionTwoImageSix = req.files && req.files['sectionTwoImageSix'] ? req.files['sectionTwoImageSix'][0].filename : null;

                // Find existing home page content if editId is present
                let data;
                if (editId) {
                    data = await homePageModel.findById(editId);

                    if (!data) {
                        return res.status(404).json({ message: 'HomePage content not found for the provided ID', status: false });
                    }

                    // Update only the fields that have new values, retain old values for unchanged fields
                    const homePageData = {
                        headingOne, descriptionOne, buttonOne,
                        headingTwo, subHeadingTwo, sectionTwoTitleOne, sectionTwoTitleTwo, sectionTwoTitleThree, sectionTwoTitleFour, sectionTwoTitleFive, sectionTwoTitleSix,
                        headingThree, subHeadingThree, descriptionThree, stateHeading,
                        headingFour, descriptionFour,
                        cardTextOne, cardTextTwo, cardTextThree, cardTextFour, cardCountOne, cardCountTwo, cardCountThree, cardCountFour,
                    };

                    // Only set new images if they were uploaded
                    if (imageOne) homePageData.imageOne = imageOne;
                    else homePageData.imageOne = data.imageOne; // Keep the existing image if not uploaded

                    if (sectionTwoImageOne) homePageData.sectionTwoImageOne = sectionTwoImageOne;
                    else homePageData.sectionTwoImageOne = data.sectionTwoImageOne;

                    if (sectionTwoImageTwo) homePageData.sectionTwoImageTwo = sectionTwoImageTwo;
                    else homePageData.sectionTwoImageTwo = data.sectionTwoImageTwo;

                    if (sectionTwoImageThree) homePageData.sectionTwoImageThree = sectionTwoImageThree;
                    else homePageData.sectionTwoImageThree = data.sectionTwoImageThree;

                    if (sectionTwoImageFour) homePageData.sectionTwoImageFour = sectionTwoImageFour;
                    else homePageData.sectionTwoImageFour = data.sectionTwoImageFour;

                    if (sectionTwoImageFive) homePageData.sectionTwoImageFive = sectionTwoImageFive;
                    else homePageData.sectionTwoImageFive = data.sectionTwoImageFive;

                    if (sectionTwoImageSix) homePageData.sectionTwoImageSix = sectionTwoImageSix;
                    else homePageData.sectionTwoImageSix = data.sectionTwoImageSix;

                    // Update the database with the modified home page data
                    data = await homePageModel.findByIdAndUpdate(editId, homePageData, { new: true });

                    return res.status(200).json({
                        status: true,
                        message: 'HomePage Content updated successfully',
                        data,
                    });
                } else {
                    // Create new homepage content if no editId provided
                    const homePageData = {
                        headingOne, descriptionOne, imageOne, buttonOne,
                        headingTwo, subHeadingTwo, sectionTwoTitleOne, sectionTwoTitleTwo, sectionTwoTitleThree, sectionTwoTitleFour, sectionTwoTitleFive, sectionTwoTitleSix,
                        sectionTwoImageOne, sectionTwoImageTwo, sectionTwoImageThree, sectionTwoImageFour, sectionTwoImageFive, sectionTwoImageSix,
                        headingThree, subHeadingThree, descriptionThree, stateHeading,
                        headingFour, descriptionFour,
                        cardTextOne, cardTextTwo, cardTextThree, cardTextFour, cardCountOne, cardCountTwo, cardCountThree, cardCountFour
                    };

                    data = await homePageModel.create(homePageData);
                    return res.status(201).json({
                        status: true,
                        message: 'HomePage Content added successfully',
                        data,
                    });
                }
            } catch (error) {
                console.error(error);
                return res.status(500).json({ message: error.message || 'Unexpected error', status: false });
            }
        });
    },



    deleteImage: async (req, res) => {
        try {

            const homepageId = req.body.editId;
            // Find brand by dynamic ID
            const banner = await homePageModel.findById(homepageId);
            if (!banner) {
                return res.status(404).json({ message: 'banner not found', status: false });
            }

            const filePath = path.join(__dirname, '../../storage/bannerImages/original', banner.image);
            if (fs.existsSync(filePath)) {
                await unlinkAsync(filePath);
            } else {
                console.log(`File not found: ${filePath}`);
            }
            banner.image = null;


            await banner.save();
            res.status(200).json({ status: true, message: 'Banner deleted successfully' });
        } catch (error) {
            console.log(error, "error")
            res.status(500).json({ status: false, message: 'Internal Server Error' });
        }
    },



}
module.exports = homePageController
