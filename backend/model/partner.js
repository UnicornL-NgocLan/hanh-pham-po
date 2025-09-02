const mongoose = require('mongoose')

const PartnerSchema = mongoose.Schema(
    {
        code: String,
        name: String,
        customer: Boolean,
        supplier: Boolean,
        address: String,
        district: String,
        country: String,
        vat: String,
        phone: String,
        fax: String,
        accountNumber: String,
        accountBank: String,
        active: Boolean,
    },
    { timestamps: true }
)

module.exports = mongoose.model('Partner', PartnerSchema)
