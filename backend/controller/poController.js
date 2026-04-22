const mongoose = require('mongoose')
const PurchaseRequestLine = require('../model/purchaseRequestLine.js')

const PurchaseOrderLine = require('../model/purchaseOrderLine.js')
const PurchaseRequest = require('../model/purchaseRequest.js')
const PurchaseOrder = require('../model/purchaseOrder.js')
const Partner = require('../model/partner.js')
const PurchaseRequestSequence = require('../model/purchaseRequestSequence.js')
const UsedQuantityTransaction = require('../model/usedQuantityTransaction.js')
const moment = require('moment')
const Product = require('../model/product.js')
const Brand = require('../model/brand.js')
const Bundle = require('../model/bundle.js')
const Packing = require('../model/packing.js')

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
            const data = await PurchaseRequest.create({
                name: newPurchaseRequestName,
                partner_id,
                customer_id,
                date: plus7HoursDate,
                contract_code,
            })
            res.status(200).json({
                msg: 'Create purchase request success.',
                data,
            })
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

    createPurchaseOrder: async (req, res) => {
        try {
            const {
                partner_id,
                date_deliveried,
                delivered_to,
                date_ordered,
                customer_id,
                date,
                replacedForContract,
                contract_id,
                buyer_id,
            } = req.body

            if (
                !partner_id ||
                !customer_id ||
                !date_ordered ||
                !replacedForContract
            )
                return res.status(400).json({ msg: 'Missing required fields.' })

            const partner = await Partner.findById(partner_id)
            if (!partner)
                return res.status(400).json({ msg: 'Partner does not exist.' })

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
            const newPurchaseRequestName = `${number} /D${req.body.is_backup ? 'P' : 'N'} TS ${
                plus7HoursDate.getMonth() + 1
            } ${plus7HoursDate.getFullYear()} - ${partner.code}`

            const newPurchaseOrderName = `${number} /D${req.body.is_backup ? 'P' : 'H'} ${
                plus7HoursDate.getMonth() + 1
            } ${plus7HoursDate.getFullYear()} - ${partner.code}`

            const data = await PurchaseOrder.create({
                name: newPurchaseOrderName,
                customer_id,
                date,
                replacedForContract,
                pr_name: newPurchaseRequestName,
                partner_id,
                date_deliveried,
                delivered_to,
                contract_id,
                buyer_id,
                date_ordered,
                is_backup: req.body.is_backup || false,
            })
            res.status(200).json({
                msg: 'Create purchase order success.',
                data,
            })
        } catch (error) {
            res.status(500).json({ msg: error.message })
        }
    },

    updatePurchaseOrder: async (req, res) => {
        try {
            let parameters = { ...req.body }
            const { id } = req.params

            await PurchaseOrder.findOneAndUpdate(
                { _id: id },
                { ...parameters },
                { new: true }
            )
            res.status(200).json({ msg: 'OK' })
        } catch (error) {
            res.status(500).json({ msg: error.message })
        }
    },

    getPurchaseOrders: async (req, res) => {
        try {
            const is_backup = req.query.is_backup === 'true'
            const data = await PurchaseOrder.find({
                is_backup: is_backup ? true : { $ne: true },
            })
                .populate('partner_id customer_id contract_id buyer_id')
                .sort({ date_ordered: -1 })
            res.status(200).json({ data })
        } catch (error) {
            res.status(500).json({ msg: error.message })
        }
    },

    createPurchaseOrderLine: async (req, res) => {
        try {
            const {
                order_id,
                product_id,
                uom_id,
                quy_cach,
                contract_quantity,
                need_quantity,
                quotation_date,
                kho_tong,
                loss_rate,
                buyer_id,
                contract_id,
                note,
                standard,
                quantity,
                price_unit,
                sub_total,
                brand_id,
                bundle_id,
                packing_id,
            } = req.body

            if (!order_id || !product_id || !uom_id || !buyer_id)
                return res
                    .status(400)
                    .json({ msg: 'Please fill in all required fields.' })

            await PurchaseOrderLine.create({
                order_id,
                product_id,
                uom_id,
                quy_cach,
                contract_quantity,
                need_quantity,
                kho_tong,
                loss_rate,
                buyer_id,
                contract_id,
                note,
                quotation_date,
                standard,
                quantity,
                price_unit,
                sub_total,
                brand_id,
                bundle_id,
                packing_id,
            })

            const listOfPols = await PurchaseOrderLine.find({ order_id })
            let total_amount_untaxed = 0
            let total_tax = 0

            for (let i = 0; i < listOfPols.length; i++) {
                total_amount_untaxed += listOfPols[i].sub_total
            }

            total_tax = (total_amount_untaxed * 8) / 100
            await PurchaseOrder.findOneAndUpdate(
                { _id: order_id },
                {
                    amount_untaxed: total_amount_untaxed,
                    tax: total_tax,
                    total_amount: total_amount_untaxed + total_tax,
                }
            )
            res.status(200).json({ msg: 'OK' })
        } catch (error) {
            res.status(500).json({ msg: error.message })
        }
    },

    updatePurchaseOrderLine: async (req, res) => {
        try {
            let parameters = { ...req.body }
            const { id } = req.params

            await PurchaseOrderLine.findOneAndUpdate(
                { _id: id },
                { ...parameters },
                { new: true }
            )

            const currentPol = await PurchaseOrderLine.findOne({ _id: id })

            const listOfPols = await PurchaseOrderLine.find({
                order_id: currentPol.order_id,
            })
            let total_amount_untaxed = 0
            let total_tax = 0

            for (let i = 0; i < listOfPols.length; i++) {
                total_amount_untaxed += listOfPols[i].sub_total
            }

            total_tax = (total_amount_untaxed * 8) / 100

            await PurchaseOrder.findOneAndUpdate(
                { _id: currentPol.order_id },
                {
                    amount_untaxed: total_amount_untaxed,
                    tax: total_tax,
                    total_amount: total_amount_untaxed + total_tax,
                }
            )
            res.status(200).json({ msg: 'OK' })
        } catch (error) {
            res.status(500).json({ msg: error.message })
        }
    },

    deletePurchaseOrderLine: async (req, res) => {
        try {
            const { id } = req.params
            const currentPol = await PurchaseOrderLine.findOne({ _id: id })
            await PurchaseOrderLine.findOneAndDelete({ _id: id })

            const listOfPols = await PurchaseOrderLine.find({
                order_id: currentPol.order_id,
            })
            let total_amount_untaxed = 0
            let total_tax = 0

            for (let i = 0; i < listOfPols.length; i++) {
                total_amount_untaxed += listOfPols[i].sub_total
            }

            total_tax = (total_amount_untaxed * 8) / 100

            await PurchaseOrder.findOneAndUpdate(
                { _id: currentPol.order_id },
                {
                    amount_untaxed: total_amount_untaxed,
                    tax: total_tax,
                    total_amount: total_amount_untaxed + total_tax,
                }
            )
            res.status(200).json({ msg: 'OK' })
        } catch (error) {
            res.status(500).json({ msg: error.message })
        }
    },

    getPurchaseOrderLines: async (req, res) => {
        try {
            const { order_id } = req.params
            const data = await PurchaseOrderLine.find({
                order_id: order_id,
            }).populate(
                'product_id uom_id contract_id buyer_id brand_id bundle_id packing_id'
            )

            const respectivePurchaseOrder = await PurchaseOrder.findOne({
                _id: order_id,
            }).populate('partner_id pr_id customer_id')
            res.status(200).json({ data, po: respectivePurchaseOrder })
        } catch (error) {
            res.status(500).json({ msg: error.message })
        }
    },

    getPurchaseOrderLinesHistory: async (req, res) => {
        try {
            const { product_id } = req.params
            const data = await PurchaseOrderLine.find({
                product_id: product_id,
            })
                .populate(
                    'product_id uom_id buyer_id contract_id order_id brand_id bundle_id packing_id'
                )
                .sort({ quotation_date: -1, createdAt: -1 })
            res.status(200).json({ data })
        } catch (error) {
            res.status(500).json({ msg: error.message })
        }
    },

    getPurchaseOrderLinesByContract: async (req, res) => {
        try {
            const { contract_id } = req.params
            const data = await PurchaseOrderLine.find({
                contract_id: contract_id,
            })
                .populate(
                    'product_id uom_id buyer_id contract_id order_id brand_id bundle_id packing_id'
                )
                .sort({ quotation_date: -1 })
            res.status(200).json({ data })
        } catch (error) {
            res.status(500).json({ msg: error.message })
        }
    },

    deletePurchaseOrder: async (req, res) => {
        try {
            const { id } = req.params
            await PurchaseOrderLine.deleteMany({
                order_id: id,
            })
            await PurchaseOrder.findOneAndDelete({ _id: id })

            res.status(200).json({ msg: 'OK' })
        } catch (error) {
            res.status(500).json({ msg: error.message })
        }
    },

    getPurchaseOrderLinesTracker: async (req, res) => {
        try {
            const { buyer_id, bundle_id, brand_id, packing_id } = req.query
            let query = {}

            if (buyer_id && buyer_id !== 'all') query.buyer_id = buyer_id
            if (bundle_id && bundle_id !== 'all') query.bundle_id = bundle_id
            if (brand_id && brand_id !== 'all') query.brand_id = brand_id
            if (packing_id && packing_id !== 'all')
                query.packing_id = packing_id

            const data = await PurchaseOrderLine.find(query)
                .populate({
                    path: 'order_id',
                    match: { is_backup: true },
                })
                .populate(
                    'product_id bundle_id uom_id buyer_id contract_id brand_id packing_id'
                )
                .sort({ createdAt: -1 })

            const filteredData = data.filter((item) => item.order_id)

            res.status(200).json({ data: filteredData })
        } catch (error) {
            res.status(500).json({ msg: error.message })
        }
    },

    bulkUpdateReceiptDate: async (req, res) => {
        try {
            const { data } = req.body // Array of { order_name, date_received }

            if (!data || !Array.isArray(data)) {
                return res.status(400).json({ msg: 'Dữ liệu không hợp lệ.' })
            }

            const updatePromises = data.map((item) => {
                const escapedName = item.order_name.replace(
                    /[.*+?^${}()|[\]\\]/g,
                    '\\$&'
                )
                const regexPattern = `^\\s*${escapedName
                    .split('')
                    .join('\\s*')}\\s*$`

                return PurchaseOrder.findOneAndUpdate(
                    { name: { $regex: regexPattern, $options: 'i' } },
                    { date_received: item.date_received },
                    { new: true }
                )
            })

            await Promise.all(updatePromises)
            res.status(200).json({ msg: 'Cập nhật ngày nhập kho thành công.' })
        } catch (error) {
            res.status(500).json({ msg: error.message })
        }
    },
    createUsedQuantityTransaction: async (req, res) => {
        try {
            const {
                purchase_order_line_id,
                usedQuantity,
                usedDate,
                usedForContractId,
            } = req.body
            if (!purchase_order_line_id || usedQuantity === undefined) {
                return res.status(400).json({ msg: 'Missing required fields.' })
            }

            // Validate: tổng usedQuantity không được vượt quá quantity của PO line
            const poLine = await PurchaseOrderLine.findById(
                purchase_order_line_id
            )
            if (!poLine) {
                return res
                    .status(400)
                    .json({ msg: 'Purchase order line not found.' })
            }

            const existingTxns = await UsedQuantityTransaction.find({
                purchase_order_line_id,
            })
            const totalUsed = existingTxns.reduce(
                (sum, t) => sum + (t.usedQuantity || 0),
                0
            )

            if (totalUsed + usedQuantity > (poLine.quantity || 0)) {
                return res.status(400).json({
                    msg: `Số lượng vượt quá giới hạn. Đã sử dụng: ${totalUsed}, Số lượng đơn: ${poLine.quantity}, Còn lại: ${poLine.quantity - totalUsed}`,
                })
            }

            const data = await UsedQuantityTransaction.create({
                purchase_order_line_id,
                usedQuantity,
                usedDate: usedDate || null,
                usedForContractId: usedForContractId || null,
            })
            const populated = await UsedQuantityTransaction.findById(
                data._id
            ).populate('usedForContractId')
            res.status(200).json({ msg: 'OK', data: populated })
        } catch (error) {
            res.status(500).json({ msg: error.message })
        }
    },

    getUsedQuantityTransactionsByLine: async (req, res) => {
        try {
            const { line_id } = req.params
            const data = await UsedQuantityTransaction.find({
                purchase_order_line_id: line_id,
            })
                .populate('usedForContractId')
                .sort({ createdAt: 1 })
            res.status(200).json({ data })
        } catch (error) {
            res.status(500).json({ msg: error.message })
        }
    },

    deleteUsedQuantityTransaction: async (req, res) => {
        try {
            const { id } = req.params
            await UsedQuantityTransaction.findByIdAndDelete(id)
            res.status(200).json({ msg: 'OK' })
        } catch (error) {
            res.status(500).json({ msg: error.message })
        }
    },

    getUsedQuantityTransactionsByLines: async (req, res) => {
        try {
            const { line_ids } = req.query // comma-separated list of line IDs
            if (!line_ids)
                return res.status(400).json({ msg: 'Missing line_ids' })
            const ids = line_ids.split(',').filter(Boolean)
            const data = await UsedQuantityTransaction.find({
                purchase_order_line_id: { $in: ids },
            })
                .populate('usedForContractId')
                .sort({ createdAt: 1 })
            res.status(200).json({ data })
        } catch (error) {
            res.status(500).json({ msg: error.message })
        }
    },

    updateUsedQuantityTransaction: async (req, res) => {
        try {
            const { id } = req.params
            const { usedQuantity, usedDate, usedForContractId } = req.body

            const existing = await UsedQuantityTransaction.findById(id)
            if (!existing)
                return res.status(404).json({ msg: 'Record not found.' })

            // Validate quantity cap (exclude self from sum)
            if (usedQuantity !== undefined) {
                const poLine = await PurchaseOrderLine.findById(
                    existing.purchase_order_line_id
                )
                if (!poLine)
                    return res
                        .status(400)
                        .json({ msg: 'Purchase order line not found.' })

                const otherTxns = await UsedQuantityTransaction.find({
                    purchase_order_line_id: existing.purchase_order_line_id,
                    _id: { $ne: id },
                })
                const otherTotal = otherTxns.reduce(
                    (sum, t) => sum + (t.usedQuantity || 0),
                    0
                )

                if (otherTotal + usedQuantity > (poLine.quantity || 0)) {
                    return res.status(400).json({
                        msg: `Số lượng vượt quá giới hạn. Đã sử dụng (các record khác): ${otherTotal}, Số lượng đơn: ${poLine.quantity}, Còn lại: ${poLine.quantity - otherTotal}`,
                    })
                }
            }

            const updated = await UsedQuantityTransaction.findByIdAndUpdate(
                id,
                {
                    ...(usedQuantity !== undefined && { usedQuantity }),
                    ...(usedDate !== undefined && {
                        usedDate: usedDate || null,
                    }),
                    ...(usedForContractId !== undefined && {
                        usedForContractId: usedForContractId || null,
                    }),
                },
                { new: true }
            ).populate('usedForContractId')

            res.status(200).json({ msg: 'OK', data: updated })
        } catch (error) {
            res.status(500).json({ msg: error.message })
        }
    },

    getBackupPOReport: async (req, res) => {
        try {
            const { buyer_id, bundle_id, brand_id, packing_id } = req.query

            // 1. Tìm các POLines thuộc PO is_backup = true
            let matchPOLine = {}
            if (buyer_id && buyer_id !== 'all')
                matchPOLine.buyer_id = new mongoose.Types.ObjectId(buyer_id)
            if (bundle_id && bundle_id !== 'all')
                matchPOLine.bundle_id = new mongoose.Types.ObjectId(bundle_id)
            if (brand_id && brand_id !== 'all')
                matchPOLine.brand_id = new mongoose.Types.ObjectId(brand_id)
            if (packing_id && packing_id !== 'all')
                matchPOLine.packing_id = new mongoose.Types.ObjectId(packing_id)

            const reportData = await PurchaseOrderLine.aggregate([
                { $match: matchPOLine },
                {
                    $lookup: {
                        from: 'purchaseorders',
                        localField: 'order_id',
                        foreignField: '_id',
                        as: 'order',
                    },
                },
                { $unwind: '$order' },
                { $match: { 'order.is_backup': true } },
                {
                    $lookup: {
                        from: 'usedquantitytransactions',
                        localField: '_id',
                        foreignField: 'purchase_order_line_id',
                        as: 'transactions',
                    },
                },

                {
                    $addFields: {
                        sumUsedQty: { $sum: '$transactions.usedQuantity' },
                        isReceived: {
                            $cond: [
                                { $gt: ['$order.date_received', null] },
                                1,
                                0,
                            ],
                        },
                    },
                },
                {
                    $group: {
                        _id: {
                            buyer_id: '$buyer_id',
                            bundle_id: '$bundle_id',
                            brand_id: '$brand_id',
                            packing_id: '$packing_id',
                            product_id: '$product_id',
                        },
                        totalUsedQuantity: { $sum: '$sumUsedQty' },
                        totalQuantityAvailable: {
                            $sum: {
                                $cond: [
                                    { $eq: ['$isReceived', 1] },
                                    { $ifNull: ['$quantity', 0] },
                                    0,
                                ],
                            },
                        },
                        totalQuantityInTransit: {
                            $sum: {
                                $cond: [
                                    { $eq: ['$isReceived', 0] },
                                    { $ifNull: ['$quantity', 0] },
                                    0,
                                ],
                            },
                        },
                    },
                },
                {
                    $lookup: {
                        from: 'partners',
                        localField: '_id.buyer_id',
                        foreignField: '_id',
                        as: 'buyer',
                    },
                },
                {
                    $lookup: {
                        from: 'bundles',
                        localField: '_id.bundle_id',
                        foreignField: '_id',
                        as: 'bundle',
                    },
                },
                {
                    $lookup: {
                        from: 'brands',
                        localField: '_id.brand_id',
                        foreignField: '_id',
                        as: 'brand',
                    },
                },
                {
                    $lookup: {
                        from: 'packings',
                        localField: '_id.packing_id',
                        foreignField: '_id',
                        as: 'packing',
                    },
                },
                {
                    $lookup: {
                        from: 'products',
                        localField: '_id.product_id',
                        foreignField: '_id',
                        as: 'product',
                    },
                },
                {
                    $project: {
                        _id: 0,
                        buyer: { $arrayElemAt: ['$buyer.name', 0] },
                        bundle: { $arrayElemAt: ['$bundle.name', 0] },
                        brand: { $arrayElemAt: ['$brand.name', 0] },
                        packing: { $arrayElemAt: ['$packing.name', 0] },
                        numCartonPerCont: {
                            $ifNull: [
                                {
                                    $arrayElemAt: [
                                        '$bundle.number_of_carton_per_container',
                                        0,
                                    ],
                                },
                                0,
                            ],
                        },
                        product: { $arrayElemAt: ['$product.name', 0] },
                        totalUsedQuantity: 1,
                        totalQuantityAvailable: 1,
                        totalQuantityInTransit: 1,
                        totalContAvailable: {
                            $cond: [
                                {
                                    $gt: [
                                        {
                                            $ifNull: [
                                                {
                                                    $arrayElemAt: [
                                                        '$bundle.number_of_carton_per_container',
                                                        0,
                                                    ],
                                                },
                                                0,
                                            ],
                                        },
                                        0,
                                    ],
                                },
                                {
                                    $divide: [
                                        '$totalQuantityAvailable',
                                        {
                                            $arrayElemAt: [
                                                '$bundle.number_of_carton_per_container',
                                                0,
                                            ],
                                        },
                                    ],
                                },
                                0,
                            ],
                        },
                        totalContInTransit: {
                            $cond: [
                                {
                                    $gt: [
                                        {
                                            $ifNull: [
                                                {
                                                    $arrayElemAt: [
                                                        '$bundle.number_of_carton_per_container',
                                                        0,
                                                    ],
                                                },
                                                0,
                                            ],
                                        },
                                        0,
                                    ],
                                },
                                {
                                    $divide: [
                                        '$totalQuantityInTransit',
                                        {
                                            $arrayElemAt: [
                                                '$bundle.number_of_carton_per_container',
                                                0,
                                            ],
                                        },
                                    ],
                                },
                                0,
                            ],
                        },
                    },
                },
            ])

            res.status(200).json({ data: reportData })
        } catch (error) {
            res.status(500).json({ msg: error.message })
        }
    },
}

module.exports = poCtrl
