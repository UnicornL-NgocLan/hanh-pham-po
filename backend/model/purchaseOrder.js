const mongoose = require('mongoose')

const PurchaseOrderSchema = mongoose.Schema(
    {
        name: String,
        replaced_for_contract: String,
        pr_id: { type: mongoose.Schema.Types.ObjectId, ref: 'PurchaseRequest' },
        quotation_date: Date,
        partner_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Partner' },
        buyer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Partner' },
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
    },
    { timestamps: true }
)

module.exports = mongoose.model('PurchaseOrder', PurchaseOrderSchema)
