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
        height: Number,
        width: Number,
        length: Number,
        leadTime: Number,
    },
    { timestamps: true }
)

module.exports = mongoose.model('Product', ProductSchema)
