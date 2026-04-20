const mongoose = require('mongoose')

const bundleSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        number_of_carton_per_container: Number,
    },
    { timestamps: true }
)

module.exports = mongoose.model('Bundle', bundleSchema)
