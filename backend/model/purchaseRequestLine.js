const mongoose = require('mongoose')

const PurchaseRequestLineSchema = mongoose.Schema(
    {
        order_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'PurchaseRequest',
        },
        product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        uom_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Uom' },
        quy_cach: String,
        contract_quantity: Number,
        need_quantity: Number,
        kho_tong: Number,
        loss_rate: Number,
        kho_tan_long: Number,
        kho_an_phu: Number,
        note: String,
    },
    { timestamps: true }
)

module.exports = mongoose.model(
    'PurchaseRequestLine',
    PurchaseRequestLineSchema
)
