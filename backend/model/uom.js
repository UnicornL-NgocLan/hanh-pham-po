const mongoose = require('mongoose')

const UomSchema = mongoose.Schema(
    {
        name: String,
    },
    { timestamps: true }
)

module.exports = mongoose.model('Uom', UomSchema)
