const mongoose = require('mongoose')

const packingSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
    },
    { timestamps: true }
)

module.exports = mongoose.model('Packing', packingSchema)
