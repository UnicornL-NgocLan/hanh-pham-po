const mongoose = require('mongoose')

const PurchaseRequestSequenceSchema = mongoose.Schema(
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

module.exports = mongoose.model(
    'PurchaseRequestSequence',
    PurchaseRequestSequenceSchema
)
