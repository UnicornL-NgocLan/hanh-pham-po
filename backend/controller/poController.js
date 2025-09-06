const PurchaseRequestLine = require('../model/purchaseRequestLine.js')
const PurchaseRequest = require('../model/purchaseRequest.js')
const Partner = require('../model/partner.js')
const PurchaseRequestSequence = require('../model/purchaseRequestSequence.js')
const moment = require('moment')

const poCtrl = {
    createPurChaseRequest: async (req, res) => {
        try {
            const { partner_id, contract_code, date, customer_id } = req.body

            if (!date || !partner_id || !customer_id)
                return res.status(400).json({ msg: 'Missing required fields.' })

            const partner = await Partner.findById(partner_id)
            if (!partner)
                return res.status(400).json({ msg: 'Partner does not exist.' })

            const customer = await Partner.findById(customer_id)
            if (!customer)
                return res.status(400).json({ msg: 'Customer does not exist.' })

            let plus7HoursDate = moment(date).add(7, 'hours').toDate()
            plus7HoursDate.setHours(plus7HoursDate.getHours() + 7)

            const currentSequencePeriod = await PurchaseRequestSequence.findOne(
                {
                    partner_id,
                    from: { $lte: plus7HoursDate },
                    to: { $gte: plus7HoursDate },
                }
            )
            let number = 1
            if (currentSequencePeriod) {
                const newNumber = currentSequencePeriod.currentNumber + 1
                number = newNumber
                await PurchaseRequestSequence.findByIdAndUpdate(
                    currentSequencePeriod._id,
                    { currentNumber: newNumber },
                    { new: true }
                )
            } else {
                const firstDateOfThisMonth = moment(
                    new Date(
                        plus7HoursDate.getFullYear(),
                        plus7HoursDate.getMonth(),
                        1,
                        0,
                        0,
                        0,
                        0
                    )
                )
                    .add(7, 'hours')
                    .toDate()
                const lastDateOfThisMonth = moment(
                    new Date(
                        plus7HoursDate.getFullYear(),
                        plus7HoursDate.getMonth() + 1,
                        0,
                        23,
                        59,
                        59,
                        0
                    )
                )
                    .add(7, 'hours')
                    .toDate()
                await PurchaseRequestSequence.create({
                    currentNumber: 1,
                    partner_id,
                    from: firstDateOfThisMonth,
                    to: lastDateOfThisMonth,
                })
            }
            const newPurchaseRequestName = `${number} /DN TS ${
                plus7HoursDate.getMonth() + 1
            } ${plus7HoursDate.getFullYear()} - ${partner.short_name}`
            await PurchaseRequest.create({
                name: newPurchaseRequestName,
                partner_id,
                customer_id,
                date: plus7HoursDate,
                contract_code,
            })
            res.status(200).json({ msg: 'Create purchase request success.' })
        } catch (error) {
            res.status(500).json({ msg: error.message })
        }
    },

    updatePurchaseRequest: async (req, res) => {
        try {
            let parameters = { ...req.body }
            const { id } = req.params

            await PurchaseRequest.findOneAndUpdate(
                { _id: id },
                { ...parameters },
                { new: true }
            )
            res.status(200).json({ msg: 'OK' })
        } catch (error) {
            res.status(500).json({ msg: error.message })
        }
    },

    getPurchaseRequests: async (req, res) => {
        try {
            const data = await PurchaseRequest.find({}).populate(
                'partner_id customer_id'
            )
            res.status(200).json({ data })
        } catch (error) {
            res.status(500).json({ msg: error.message })
        }
    },

    getPurchaseRequestSequences: async (req, res) => {
        try {
            const data = await PurchaseRequestSequence.find({}).populate(
                'partner_id'
            )
            res.status(200).json({ data })
        } catch (error) {
            res.status(500).json({ msg: error.message })
        }
    },

    updatePurchaseRequestSequence: async (req, res) => {
        try {
            let parameters = { ...req.body }
            const { id } = req.params

            await PurchaseRequestSequence.findOneAndUpdate(
                { _id: id },
                { ...parameters },
                { new: true }
            )
            res.status(200).json({ msg: 'OK' })
        } catch (error) {
            res.status(500).json({ msg: error.message })
        }
    },

    createPurchaseRequestLine: async (req, res) => {
        try {
            const {
                order_id,
                product_id,
                uom_id,
                length,
                width,
                height,
                contract_quantity,
                need_quantity,
                loss_rate,
                kho_tong,
                kho_tan_long,
                kho_an_phu,
                note,
            } = req.body

            if (!order_id || !product_id || !uom_id)
                return res
                    .status(400)
                    .json({ msg: 'Please fill in all required fields.' })

            await PurchaseRequestLine.create({
                order_id,
                product_id,
                uom_id,
                length,
                width,
                height,
                contract_quantity,
                need_quantity,
                kho_tong,
                kho_tan_long,
                kho_an_phu,
                loss_rate,
                note,
            })

            res.status(200).json({ msg: 'OK' })
        } catch (error) {
            res.status(500).json({ msg: error.message })
        }
    },

    updatePurchaseRequestLine: async (req, res) => {
        try {
            let parameters = { ...req.body }
            const { id } = req.params

            await PurchaseRequestLine.findOneAndUpdate(
                { _id: id },
                { ...parameters },
                { new: true }
            )
            res.status(200).json({ msg: 'OK' })
        } catch (error) {
            res.status(500).json({ msg: error.message })
        }
    },

    deletePurchaseRequestLine: async (req, res) => {
        try {
            const { id } = req.params
            await PurchaseRequestLine.findOneAndDelete({ _id: id })
            res.status(200).json({ msg: 'OK' })
        } catch (error) {
            res.status(500).json({ msg: error.message })
        }
    },

    getPurchaseRequestLines: async (req, res) => {
        try {
            const { order_id } = req.params
            const data = await PurchaseRequestLine.find({
                order_id: order_id,
            }).populate('product_id uom_id')

            res.status(200).json({ data })
        } catch (error) {
            res.status(500).json({ msg: error.message })
        }
    },
}

module.exports = poCtrl
