const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const styleSchema = new Schema({
    packageId: {
        type: Schema.Types.ObjectId,
        ref: 'Package'
    },
    barColor: {
        type: String,
        default: null
    },
    textColor: {
        type: String,
        default: null
    },
    badgeBgColor: {
        type: String,
        default: null
    },
    badgeTextColor: {
        type: String,
        default: null
    }
})

const Style = mongoose.model('Style', styleSchema)

module.exports = Style;
