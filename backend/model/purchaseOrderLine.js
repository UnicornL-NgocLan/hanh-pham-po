const mongoose = require('mongoose')

const PurchaseOrderLineSchema = mongoose.Schema(
    {
        order_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'PurchaseOrder',
        },
        product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        uom_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Uom' },
        length: Number,
        width: Number,
        height: Number,
        quantity: Number,
        price_unit: Number,
        sub_total: Number,
        note: String,
    },
    { timestamps: true }
)

module.exports = mongoose.model('PurchaseOrderLine', PurchaseOrderLineSchema)
