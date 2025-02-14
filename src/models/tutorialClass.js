const mongoose = require('mongoose');

const TutorialSchema = new mongoose.Schema({
    title: { type: String, default: null },
    description: { type: String, default: null },
    image: { type: String, default: null },
    deletedAt: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    mainHeading: { type: String, default: null },
    VirtualInstruction: { type: String, default: null },
    expertTutors: { type: String, default: null },
    classRecording: { type: String, default: null },



    // English Fields
    englishOne: { type: String, default: null },
    englishTwo: { type: String, default: null },
    englishThree: { type: String, default: null },
    englishFour: { type: String, default: null },
    englishFive: { type: String, default: null },
    englishSix: { type: String, default: null },

    // Math Fields
    MathOne: { type: String, default: null },
    MathTwo: { type: String, default: null },
    MathThree: { type: String, default: null },
    MathFour: { type: String, default: null },
    MathFive: { type: String, default: null },
    MathSix: { type: String, default: null },

    // Section Three Fields for Levels and Descriptions
    readingUpperLevel: { type: String, default: null },
    readingUpperLevelDesc: { type: String, default: null },
    readingLowerLevel: { type: String, default: null },
    readingLowerLevelDesc: { type: String, default: null },
    writingLevel: { type: String, default: null },
    WritingDesc: { type: String, default: null },
    verbalLevel: { type: String, default: null },
    verbalLevelDesc: { type: String, default: null },

    // Math Section Fields for Upper/Lower Levels and Descriptions
    readingUpperLevelMath: { type: String, default: null },
    readingUpperLevelDescMath: { type: String, default: null },
    readingLowerLevelMath: { type: String, default: null },
    readingLowerLevelDescMath: { type: String, default: null },
    writingMath: { type: String, default: null },
    writingDescMath: { type: String, default: null },
    verbalLevelMath: { type: String, default: null },
    verbalLevelDescMath: { type: String, default: null },

    // Sub Headings (from both English and Math Sections)
    subHeadingEnglishOne: { type: String, default: null },
    subHeadingEnglishTwo: { type: String, default: null },
    subHeadingEnglishThree: { type: String, default: null },
    subHeadingEnglishFour: { type: String, default: null },
    subHeadingEnglishFive: { type: String, default: null },
    subHeadingEnglishSix: { type: String, default: null },
    subHeadingEnglishSeven: { type: String, default: null },
    subHeadingEnglishEight: { type: String, default: null },

    subHeadingMathOne: { type: String, default: null },
    subHeadingMathTwo: { type: String, default: null },
    subHeadingMathThree: { type: String, default: null },
    subHeadingMathFour: { type: String, default: null },
    subHeadingMathFive: { type: String, default: null },
    subHeadingMathSix: { type: String, default: null },
    subHeadingMathSeven: { type: String, default: null },
    subHeadingMathEight: { type: String, default: null },

    //English
    titleyrFiveSix: { type: String, default: null },
    titleyrFiveSixDesc: { type: String, default: null },
    subHeadingOneYrFiveSix: { type: String, default: null },
    subHeadingTwoYrFiveSix: { type: String, default: null },
    titleyrSixSeven: { type: String, default: null },
    titleyrSixSevenDesc: { type: String, default: null },
    subHeadingOneYrSixSeven: { type: String, default: null },
    subHeadingTwoYrSixSeven: { type: String, default: null },


    //Math

    titleyrMathFiveSix: { type: String, default: null },
    titleYrMathFiveSixDesc: { type: String, default: null },
    subHeadingMathOneYrFiveSix: { type: String, default: null },
    subHeadingMathTwoYrFiveSix: { type: String, default: null },
    titleyrMathSixSeven: { type: String, default: null },
    titleYrMathSixSevenDesc: { type: String, default: null },
    subHeadingMathOneYrSixSeven: { type: String, default: null },
    subHeadingMathTwoYrSixSeven: { type: String, default: null },

});

module.exports = mongoose.model('Tutorial', TutorialSchema);
