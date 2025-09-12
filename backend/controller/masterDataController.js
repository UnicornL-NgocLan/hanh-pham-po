const Partners = require('../model/partner.js')
const Products = require('../model/product.js')
const Uoms = require('../model/uom.js')
const Contracts = require('../model/contract.js')

const masterDataCtrl = {
    createPartner: async (req, res) => {
        try {
            const {
                code,
                name,
                short_name,
                address,
                vat,
                district,
                country,
                phone,
                fax,
                accountNumber,
                replacedForContract,
                city,
                accountBank,
            } = req.body

            await Partners.create({
                code,
                name,
                address,
                short_name,
                vat,
                district,
                replacedForContract,
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
            const { code, name, uom_id, standard, quy_cach } = req.body

            await Products.create({
                code,
                name,
                uom_id,
                standard,
                quy_cach,
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

    createContract: async (req, res) => {
        try {
            const { code, partner_id } = req.body
            await Contracts.create({ code, partner_id })
            res.status(200).json({ msg: 'OK' })
        } catch (error) {
            res.status(500).json({ msg: error.message })
        }
    },

    updateContract: async (req, res) => {
        try {
            let parameters = { ...req.body }
            const { id } = req.params

            await Contracts.findOneAndUpdate(
                { _id: id },
                { ...parameters },
                { new: true }
            )
            res.status(200).json({ msg: 'OK' })
        } catch (error) {
            res.status(500).json({ msg: error.message })
        }
    },

    getContracts: async (req, res) => {
        try {
            const data = await Contracts.find({}).populate('partner_id')
            res.status(200).json({ data })
        } catch (error) {
            res.status(500).json({ msg: error.message })
        }
    },
}

module.exports = masterDataCtrl
