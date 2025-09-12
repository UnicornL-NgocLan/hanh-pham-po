const mongoose = require('mongoose')

const ProductSchema = mongoose.Schema(
    {
        code: String,
        name: String,
        uom_id: {
            type: mongoose.Types.ObjectId,
            ref: 'Uom',
        },
        active: { type: Boolean, default: true },
        quy_cach: String,
        standard: String,
    },
    { timestamps: true }
)

module.exports = mongoose.model('Product', ProductSchema)
