const mongoose = require('mongoose')

const UomSchema = mongoose.Schema(
    {
        currentNumber: Number,
        partner_id: {
            type: mongoose.Types.ObjectId,
            ref: 'Partner',
        },
        from: Date,
        to: Date,
    },
    { timestamps: true }
)

module.exports = mongoose.model('Uom', UomSchema)
