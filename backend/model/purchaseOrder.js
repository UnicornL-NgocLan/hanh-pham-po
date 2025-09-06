const mongoose = require('mongoose')

const PurchaseOrderSchema = mongoose.Schema(
    {
        name: String,
        partner_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Partner' },
        orderDate: Date,
    },
    { timestamps: true }
)

module.exports = mongoose.model('PurchaseOrder', PurchaseOrderSchema)
