const mongoose = require('mongoose')

const PartnerSchema = mongoose.Schema(
    {
        code: String,
        name: String,
        short_name: String,
        address: String,
        district: String,
        city: String,
        country: String,
        phone: String,
        vat: String,
        fax: String,
        accountNumber: String,
        accountBank: String,
        active: { type: Boolean, default: true },
    },
    { timestamps: true }
)

module.exports = mongoose.model('Partner', PartnerSchema)
