const mongoose = require('mongoose')

const UsedQuantityTransactionSchema = mongoose.Schema(
    {
        purchase_order_line_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'PurchaseOrderLine',
            required: true,
        },
        usedQuantity: {
            type: Number,
            required: true,
        },
        usedDate: {
            type: Date,
        },
        usedForContractId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Contract',
        },
    },
    { timestamps: true }
)

module.exports = mongoose.model(
    'UsedQuantityTransaction',
    UsedQuantityTransactionSchema
)
