const Partners = require('../model/partner.js')
const Products = require('../model/product.js')
const Uoms = require('../model/uom.js')

const masterDataCtrl = {
    createPartner: async (req, res) => {
        try {
            const {
                code,
                name,
                address,
                vat,
                district,
                country,
                phone,
                fax,
                accountNumber,
                city,
                accountBank,
            } = req.body

            if (code) {
                const existingRecord = await Partners.findOne({ code })
                if (existingRecord)
                    return res
                        .status(400)
                        .json({ msg: 'Đã tồn tại nhà cung cấp với mã này' })
            }

            await Partners.create({
                code,
                name,
                address,
                vat,
                district,
                country,
                phone,
                fax,
                accountNumber,
                city,
                accountBank,
            })
            res.status(200).json({ msg: 'OK' })
        } catch (error) {
            res.status(500).json({ msg: error.message })
        }
    },

    updatePartner: async (req, res) => {
        try {
            let parameters = { ...req.body }
            const { id } = req.params

            await Partners.findOneAndUpdate(
                { _id: id },
                { ...parameters },
                { new: true }
            )
            res.status(200).json({ msg: 'OK' })
        } catch (error) {
            res.status(500).json({ msg: error.message })
        }
    },

    getPartners: async (req, res) => {
        try {
            const data = await Partners.find({})
            res.status(200).json({ data })
        } catch (error) {
            res.status(500).json({ msg: error.message })
        }
    },

    createProduct: async (req, res) => {
        try {
            const { code, name, uom_id, height, width, length, leadTime } =
                req.body

            if (code) {
                const existingRecord = await Products.findOne({ code })
                if (existingRecord)
                    return res
                        .status(400)
                        .json({ msg: 'Đã tồn tại sản phẩm với mã này' })
            }

            await Products.create({
                code,
                name,
                uom_id,
                height,
                width,
                length,
                leadTime,
            })
            res.status(200).json({ msg: 'OK' })
        } catch (error) {
            res.status(500).json({ msg: error.message })
        }
    },

    updateProduct: async (req, res) => {
        try {
            let parameters = { ...req.body }
            const { id } = req.params

            await Products.findOneAndUpdate(
                { _id: id },
                { ...parameters },
                { new: true }
            )
            res.status(200).json({ msg: 'OK' })
        } catch (error) {
            res.status(500).json({ msg: error.message })
        }
    },

    getProducts: async (req, res) => {
        try {
            const data = await Products.find({}).populate('uom_id')
            res.status(200).json({ data })
        } catch (error) {
            res.status(500).json({ msg: error.message })
        }
    },

    createUom: async (req, res) => {
        try {
            const { name } = req.body

            await Uoms.create({
                name,
            })
            res.status(200).json({ msg: 'OK' })
        } catch (error) {
            res.status(500).json({ msg: error.message })
        }
    },

    updateUom: async (req, res) => {
        try {
            let parameters = { ...req.body }
            const { id } = req.params

            await Uoms.findOneAndUpdate(
                { _id: id },
                { ...parameters },
                { new: true }
            )
            res.status(200).json({ msg: 'OK' })
        } catch (error) {
            res.status(500).json({ msg: error.message })
        }
    },

    getUoms: async (req, res) => {
        try {
            const data = await Uoms.find({})
            res.status(200).json({ data })
        } catch (error) {
            res.status(500).json({ msg: error.message })
        }
    },
}

module.exports = masterDataCtrl
