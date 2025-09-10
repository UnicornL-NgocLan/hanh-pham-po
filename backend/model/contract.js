const mongoose = require('mongoose')

const ContractSchema = mongoose.Schema(
    {
        code: String,
        partner_id: {
            type: mongoose.Types.ObjectId,
            ref: 'Partner',
        },
        active: { type: Boolean, default: true },
    },
    { timestamps: true }
)

module.exports = mongoose.model('Contract', ContractSchema)
