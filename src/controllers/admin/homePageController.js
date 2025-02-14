const homePageModel = require('../../models/HomepageContent');
const { createUpload } = require('../../utils/multerConfig');
// eslint-disable-next-line import/no-extraneous-dependencies
const moment = require('moment-timezone');

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

                // Handle imageOne
                const imageOne = req.files && req.files['imageOne'] ? req.files['imageOne'][0].filename : null;

                const sectionTwoImageOne = req.files && req.files['sectionTwoImageOne'] ? req.files['sectionTwoImageOne'][0].filename : null;
                const sectionTwoImageTwo = req.files && req.files['sectionTwoImageTwo'] ? req.files['sectionTwoImageTwo'][0].filename : null;
                const sectionTwoImageThree = req.files && req.files['sectionTwoImageThree'] ? req.files['sectionTwoImageThree'][0].filename : null;
                const sectionTwoImageFour = req.files && req.files['sectionTwoImageFour'] ? req.files['sectionTwoImageFour'][0].filename : null;
                const sectionTwoImageFive = req.files && req.files['sectionTwoImageFive'] ? req.files['sectionTwoImageFive'][0].filename : null;
                const sectionTwoImageSix = req.files && req.files['sectionTwoImageSix'] ? req.files['sectionTwoImageSix'][0].filename : null;


                // Prepare home page data
                const homePageData = {
                    headingOne, descriptionOne, imageOne, buttonOne,
                    headingTwo, subHeadingTwo, sectionTwoTitleOne, sectionTwoTitleTwo, sectionTwoTitleThree, sectionTwoTitleFour, sectionTwoTitleFive, sectionTwoTitleSix,
                    sectionTwoImageOne, sectionTwoImageTwo, sectionTwoImageThree, sectionTwoImageFour, sectionTwoImageFive, sectionTwoImageSix,
                    headingThree, subHeadingThree, descriptionThree, stateHeading,
                    headingFour, descriptionFour,
                    cardTextOne, cardTextTwo, cardTextThree, cardTextFour, cardCountOne, cardCountTwo, cardCountThree, cardCountFour
                };

                let data;

                if (editId) {
                    data = await homePageModel.findByIdAndUpdate(editId, homePageData, { new: true });

                    if (!data) {
                        return res.status(404).json({ message: 'HomePage content not found for the provided ID', status: false });
                    }

                    if (!imageOne && data.imageOne) { homePageData.imageOne = data.imageOne; }
                    if (!sectionTwoImageOne && data.sectionTwoImageOne) { homePageData.sectionTwoImageOne = data.sectionTwoImageOne; }
                    if (!sectionTwoImageTwo && data.sectionTwoImageTwo) { homePageData.sectionTwoImageTwo = data.sectionTwoImageTwo; }
                    if (!sectionTwoImageThree && data.sectionTwoImageThree) { homePageData.sectionTwoImageThree = data.sectionTwoImageThree; }
                    if (!sectionTwoImageFour && data.sectionTwoImageFour) { homePageData.sectionTwoImageFour = data.sectionTwoImageFour; }
                    if (!sectionTwoImageFive && data.sectionTwoImageFive) { homePageData.sectionTwoImageFive = data.sectionTwoImageFive; }
                    if (!sectionTwoImageSix && data.sectionTwoImageSix) { homePageData.sectionTwoImageSix = data.sectionTwoImageSix; }

                    return res.status(200).json({
                        status: true,
                        message: 'HomePage Content updated successfully',
                        data,
                    });
                } else {
                    // Create new homepage content
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



    // addFrontendHomePageContent: async (req, res) => {
    //     const upload = createUpload('homeImages');
    //     const contentFields = Array.isArray(req.body.contents)
    //         ? req.body.contents.map((_, index) => `contents[${index}][image]`)
    //         : [];

    //     upload.fields([
    //         { name: 'imageOne', maxCount: 1 },
    //         ...contentFields.map((field) => ({ name: field, maxCount: 1 })),
    //     ])(req, res, async (err) => {
    //         if (err) {
    //             console.error('Upload error:', err);
    //             return res.status(500).json({ message: 'Error uploading files', status: false });
    //         }

    //         try {
    //             const {
    //                 headingOne, buttonOne, descriptionOne,
    //                 editId,
    //                 headingTwo, subHeadingTwo,
    //                 sectionTwoTitleOne, sectionTwoTitleTwo, sectionTwoTitleThree, sectionTwoTitleFour, sectionTwoTitleFive, sectionTwoTitleSix,
    //                 headingThree, subHeadingThree, descriptionThree, subDescription, stateHeading,
    //                 headingFour, descriptionFour, cardTextOne, cardTextTwo, cardTextThree, cardTextFour,
    //                 cardCountOne, cardCountTwo, cardCountThree, cardCountFour, contents
    //             } = req.body;

    //             // Handle imageOne
    //             const imageOne = req.files && req.files['imageOne']
    //                 ? req.files['imageOne'][0].filename
    //                 : null;

    //             // Validate and process contents array
    //             const validatedContents = Array.isArray(contents) ? contents.map((content, index) => {
    //                 if (req.files && req.files[`contents[${index}][image]`]) {
    //                     content.image = req.files[`contents[${index}][image]`][0].filename;
    //                 }
    //                 return content;
    //             }) : [];


    //             // Prepare home page data
    //             const homePageData = {
    //                 headingOne, descriptionOne, imageOne, buttonOne,
    //                 headingTwo, subHeadingTwo, sectionTwoTitleOne, sectionTwoTitleTwo, sectionTwoTitleThree, sectionTwoTitleFour, sectionTwoTitleFive, sectionTwoTitleSix,
    //                 headingThree, subHeadingThree, descriptionThree, subDescription, stateHeading,
    //                 headingFour, descriptionFour,
    //                 cardTextOne, cardTextTwo, cardTextThree, cardTextFour, cardCountOne, cardCountTwo, cardCountThree, cardCountFour,
    //                 contents: validatedContents,
    //             };


    //             let data;

    //             if (editId) {
    //                 data = await homePageModel.findByIdAndUpdate(editId, homePageData, { new: true });

    //                 if (!data) {
    //                     return res.status(404).json({ message: 'HomePage content not found for the provided ID', status: false });
    //                 }

    //                 if (!imageOne && data.imageOne) {
    //                     homePageData.imageOne = data.imageOne;
    //                 }

    //                 return res.status(200).json({
    //                     status: true,
    //                     message: 'HomePage Content updated successfully',
    //                     data,
    //                 });
    //             } else {
    //                 // Create new homepage content
    //                 data = await homePageModel.create(homePageData);
    //                 return res.status(201).json({
    //                     status: true,
    //                     message: 'HomePage Content added successfully',
    //                     data,
    //                 });
    //             }
    //         } catch (error) {
    //             console.error(error);
    //             return res.status(500).json({ message: error.message || 'Unexpected error', status: false });
    //         }
    //     });
    // },



}
module.exports = homePageController
