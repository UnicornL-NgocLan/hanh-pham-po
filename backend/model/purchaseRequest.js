const mongoose = require('mongoose')

const PurchaseRequestSchema = mongoose.Schema(
    {
        name: String,
        partner_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Partner' },
        customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Partner' },
        contract_code: String,
        date: Date,
        active: { type: Boolean, default: true },
    },
    { timestamps: true }
)

module.exports = mongoose.model('PurchaseRequest', PurchaseRequestSchema)
