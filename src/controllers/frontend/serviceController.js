const HeaderMenu = require('../../models/headerMenu')
const { getAdminDataByRole, trackUserActivity } = require('../../common/functions');
const errorLogger = require('../../../logger');
const FooterMenu = require('../../models/footerMenu');
const State = require('../../models/State')
const Settings = require('../../models/adminSettings');
const test = require('../../models/test')
const ExamType = require('../../models/examType');
const Test = require("../../models/test");


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

            const headerMenus = await HeaderMenu.find().sort({ order: 1 }); // Sort by order if needed
            res.status(200).json({ status: true, data: headerMenus });
        } catch (error) {
            errorLogger(error);
            res.status(500).json({ status: false, message: 'Internal Server Error' });
        }
    },

    getFooterMenus: async (req, res) => {
        try {
            const footerMenus = await FooterMenu.find().sort({ order: 1 });
            res.status(200).json({ status: true, data: footerMenus });
        } catch (error) {
            errorLogger(error);
            res.status(500).json({ status: false, message: 'Internal Server Error' });
        }
    },
    getAllStates: async (req, res) => {

        try {
            const states = await State.find().sort({ _id: -1 });
            res.status(200).json({ status: true, data: states });
        } catch (error) {
            errorLogger(error);
            res.status(500).json({ status: false, message: 'Internal Server Error' });
        }
    },
    getSingleBrandDetails: async (req, res) => {
        try {
            const brand = await Settings.findOne().select(
                'logo favIcon email phone socialLinks waterMarkIcon address brandName time  footerDescriptionOne footerDescriptionTwo footerSubHeadingOne footerSubHeadingTwo'
            ); res.status(200).json({ status: true, data: brand });
        } catch (error) {
            errorLogger(error);
            res.status(500).json({ status: false, message: 'Internal Server Error' });
        }
    },
    getAllTests: async (req, res) => {
        try {
            const { stateId } = req.body.data;

            let tests;
            if (stateId === 'All') {
                tests = await test.find({}, { testName: 1, state: 1, testDescription: 1 }).sort({ _id: -1 });
            } else {
                const stateIds = Array.isArray(stateId) ? stateId : [stateId];
                tests = await test.find(
                    { state: { $in: stateIds } },
                    { testName: 1, state: 1, testDescription: 1 }
                ).sort({ _id: -1 });
            }

            if (tests.length === 0) {
                return res.status(404).json({ status: false, message: "No tests found for the provided stateId" });
            }

            res.status(200).json({ status: true, data: tests });

        } catch (error) {
            console.error(error);
            res.status(500).json({ status: false, message: 'Internal Server Error' });
        }
    },

    getAllStateWithTheirTests: async (req, res) => {
        try {
            // Fetch all active states
            const states = await State.find({ status: 'active' });

            // Loop through each state to get related tests and their exam types
            const statesWithTests = await Promise.all(states.map(async (state) => {
                // Fetch tests based on state ID
                const tests = await test.find({ state: state._id, status: 'active' })
                    .select('testName testDescription examType');

                // Fetch related exam types for each test
                const testsWithExamType = await Promise.all(tests.map(async (test) => {
                    const examTypeData = await ExamType.findById(test.examType).select('examType');

                    const examType = examTypeData ? examTypeData.examType : '';

                    return {
                        testName: test.testName,
                        testId: test._id,
                        testDescription: test.testDescription,
                        examType: examType,
                    };
                }));
                return {
                    state: state.title,
                    stateId: state._id,
                    tests: testsWithExamType,
                };
            }));

            res.status(200).json({ status: true, data: statesWithTests });
        } catch (error) {

            res.status(500).json({ status: false, message: 'Internal Server Error', error: error.message });
        }
    },

    getStateWithExamTypes: async (req, res) => {
        try {
            const statesWithExamTypes = await State.aggregate([
                {
                    $lookup: {
                        from: 'examtypes',
                        localField: '_id',
                        foreignField: 'stateId',
                        as: 'examTypes',
                    }
                },
                {
                    $project: {
                        title: 1,
                        slug: 1,
                        examTypes: 1
                    }
                }
            ]);
            res.status(200).json({ status: true, data: statesWithExamTypes });

        } catch (error) {
            res.status(500).json({ message: 'Error fetching data' });
        }
    },


    getStateWithExamTypesWithSlug: async (req, res) => {
        const { stateslug, examSlug } = req.params;
        try {
            const state = await State.findOne({ slug: { $regex: new RegExp(stateslug, 'i') } });
            if (!state) {
                return res.status(404).json({ message: 'State not found' });
            }
            const examType = await ExamType.findOne({
                slug: { $regex: new RegExp(examSlug, 'i') },
                stateId: state._id,
            }).populate('stateId');

            if (!examType) {
                return res.status(404).json({ message: 'Exam Type not found' });
            }

            res.status(200).json({ status: true, data: examType });
        } catch (error) {
            res.status(500).json({ message: 'Error fetching exam type' });
        }
    },

    getAllExamTypes: async (req, res) => {
        try {
            const examTypes = await ExamType.find().sort({ _id: -1 });
            res.status(200).json({ status: true, data: examTypes });
        } catch (error) {
            errorLogger(error);
            res.status(500).json({ status: false, message: 'Internal Server Error' });
        }
    },
    getFooterTests: async (req, res) => {
        try {
            const tests = await Test.find({ createTestId: null })
                .populate('subject packageName testConductedBy state')
                .sort({
                    createdAt: -1,
                });

            return res.status(200).json({
                success: true,
                message: 'Tests retrieved successfully',
                data: tests,
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                success: false,
                message: 'An error occurred while retrieving the tests',
                error: error.message,
            });
        }
    },

}
module.exports = headerMenuController;
