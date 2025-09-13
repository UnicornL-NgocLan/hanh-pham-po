const mongoose = require('mongoose')

const PurchaseOrderSchema = mongoose.Schema(
    {
        name: String,
        pr_name: String,
        pr_id: { type: mongoose.Schema.Types.ObjectId, ref: 'PurchaseRequest' },
        partner_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Partner' },
        date_deliveried: Date,
        delivered_to: String,
        loading_cost: String,
        transfer_cost: String,
        date_ordered: Date,
        payment_method_and_due_date: String,
        amount_untaxed: { type: Number, default: 0 },
        tax: { type: Number, default: 0 },
        total_amount: { type: Number, default: 0 },
        active: { type: Boolean, default: true },
        customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Partner' },
        replacedForContract: String,
        date: Date,
    },
    { timestamps: true }
)

module.exports = mongoose.model('PurchaseOrder', PurchaseOrderSchema)
