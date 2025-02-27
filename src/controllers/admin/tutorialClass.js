const tutorialSchema = require('../../models/tutorialClass');
const { createUpload } = require('../../utils/multerConfig');

const tutorialController = {
    addTutorial: async (req, res) => {
        const upload = createUpload('tutorialsImage');

        await upload.single('image')(req, res, async (err) => {
            if (err) {
                return res.status(500).json({ status: false, message: 'Error uploading image' });
            }

            // Collecting all tutorial data
            const tutorialData = {
                title: req.body.title,
                description: req.body.description,
                image: req.file ? req.file.filename : req.body.image = req.body.image === 'undefined' || req.body.image === undefined ? null : req.body.image,

                mainHeading: req.body.mainHeading,

                VirtualInstruction: req.body.VirtualInstruction,
                expertTutors: req.body.expertTutors,
                classRecording: req.body.classRecording,

                // English Fields
                englishOne: req.body.englishOne,
                englishTwo: req.body.englishTwo,
                englishThree: req.body.englishThree,
                englishFour: req.body.englishFour,
                englishFive: req.body.englishFive,
                englishSix: req.body.englishSix,

                // Math Fields
                MathOne: req.body.MathOne,
                MathTwo: req.body.MathTwo,
                MathThree: req.body.MathThree,
                MathFour: req.body.MathFour,
                MathFive: req.body.MathFive,
                MathSix: req.body.MathSix,

                // Section Three Fields
                readingUpperLevel: req.body.readingUpperLevel,
                readingUpperLevelDesc: req.body.readingUpperLevelDesc,
                readingLowerLevel: req.body.readingLowerLevel,
                readingLowerLevelDesc: req.body.readingLowerLevelDesc,
                writingLevel: req.body.writingLevel,
                WritingDesc: req.body.WritingDesc,
                verbalLevel: req.body.verbalLevel,
                verbalLevelDesc: req.body.verbalLevelDesc,

                // New Math Section Fields for Upper/Lower Levels and Descriptions
                readingUpperLevelMath: req.body.readingUpperLevelMath,
                readingUpperLevelDescMath: req.body.readingUpperLevelDescMath,
                readingLowerLevelMath: req.body.readingLowerLevelMath,
                readingLowerLevelDescMath: req.body.readingLowerLevelDescMath,
                writingMath: req.body.writingMath,
                writingDescMath: req.body.writingDescMath,
                verbalLevelMath: req.body.verbalLevelMath,
                verbalLevelDescMath: req.body.verbalLevelDescMath,

                // Sub Headings (from both English and Math Sections)
                subHeadingEnglishOne: req.body.subHeadingEnglishOne,
                subHeadingEnglishTwo: req.body.subHeadingEnglishTwo,
                subHeadingEnglishThree: req.body.subHeadingEnglishThree,
                subHeadingEnglishFour: req.body.subHeadingEnglishFour,
                subHeadingEnglishFive: req.body.subHeadingEnglishFive,
                subHeadingEnglishSix: req.body.subHeadingEnglishSix,
                subHeadingEnglishSeven: req.body.subHeadingEnglishSeven,
                subHeadingEnglishEight: req.body.subHeadingEnglishEight,

                subHeadingMathOne: req.body.subHeadingMathOne,
                subHeadingMathTwo: req.body.subHeadingMathTwo,
                subHeadingMathThree: req.body.subHeadingMathThree,
                subHeadingMathFour: req.body.subHeadingMathFour,
                subHeadingMathFive: req.body.subHeadingMathFive,
                subHeadingMathSix: req.body.subHeadingMathSix,
                subHeadingMathSeven: req.body.subHeadingMathSeven,
                subHeadingMathEight: req.body.subHeadingMathEight,

                // Section English Fields
                titleyrFiveSix: req.body.titleyrFiveSix,
                titleyrFiveSixDesc: req.body.titleyrFiveSixDesc,
                subHeadingOneYrFiveSix: req.body.subHeadingOneYrFiveSix,
                subHeadingTwoYrFiveSix: req.body.subHeadingTwoYrFiveSix,
                titleyrSixSeven: req.body.titleyrSixSeven,
                titleyrSixSevenDesc: req.body.titleyrSixSevenDesc,
                subHeadingOneYrSixSeven: req.body.subHeadingOneYrSixSeven,
                subHeadingTwoYrSixSeven: req.body.subHeadingTwoYrSixSeven,

                // Section Math Fields
                titleyrMathFiveSix: req.body.titleyrMathFiveSix,
                titleYrMathFiveSixDesc: req.body.titleYrMathFiveSixDesc,
                subHeadingMathOneYrFiveSix: req.body.subHeadingMathOneYrFiveSix,
                subHeadingMathTwoYrFiveSix: req.body.subHeadingMathTwoYrFiveSix,
                titleyrMathSixSeven: req.body.titleyrMathSixSeven,
                titleYrMathSixSevenDesc: req.body.titleYrMathSixSevenDesc,
                subHeadingMathOneYrSixSeven: req.body.subHeadingMathOneYrSixSeven,
                subHeadingMathTwoYrSixSeven: req.body.subHeadingMathTwoYrSixSeven,
            };

            if (req.body.updateId) {
                tutorialData.updateId = req.body.updateId;

                try {
                    const updatedTutorial = await tutorialSchema.findByIdAndUpdate(req.body.updateId, tutorialData, { new: true });
                    if (!updatedTutorial) {
                        return res.status(404).json({ message: 'Tutorial not found' });
                    }
                    return res.status(200).json(updatedTutorial);
                } catch (err) {
                    return res.status(500).json({ message: err.message });
                }
            }

            try {
                const newTutorial = new tutorialSchema(tutorialData);
                await newTutorial.save();
                return res.status(201).json(newTutorial);
            } catch (err) {
                return res.status(400).json({ message: err.message });
            }
        });
    },




    getTutorial: async (req, res) => {
        try {
            const getData = await tutorialSchema.find();
            if (!getData || getData.length === 0) {
                return res.status(404).json({ message: 'No tutorials found' });
            }

            res.status(200).json(getData);
        } catch (error) {
            console.error('Error fetching tutorials:', error);
            res.status(500).json({ message: 'Error retrieving tutorials', error: error.message });
        }
    }
};

module.exports = tutorialController;
