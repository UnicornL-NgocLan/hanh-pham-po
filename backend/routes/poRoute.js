const express = require('express')
const router = express.Router()
const poController = require('../controller/poController.js')

router.post('/create-pr', poController.createPurChaseRequest)
router.post('/create-pr-line', poController.createPurchaseRequestLine)
router.post('/create-po', poController.createPurchaseOrder)
router.post('/create-po-line', poController.createPurchaseOrderLine)

router.get('/get-prs', poController.getPurchaseRequests)
router.get('/get-pr-sequences', poController.getPurchaseRequestSequences)
router.get('/get-pr-lines/:order_id', poController.getPurchaseRequestLines)
router.get('/get-pos', poController.getPurchaseOrders)
router.get('/get-po-lines/:order_id', poController.getPurchaseOrderLines)
router.get('/get-po-tracker', poController.getPurchaseOrderLinesTracker)
router.get(
    '/get-po-lines-history/:product_id',
    poController.getPurchaseOrderLinesHistory
)
router.get(
    '/get-po-lines-by-contract/:contract_id',
    poController.getPurchaseOrderLinesByContract
)

router.patch(
    '/update-pr-sequence/:id',
    poController.updatePurchaseRequestSequence
)
router.patch('/update-pr/:id', poController.updatePurchaseRequest)
router.patch('/update-pr-line/:id', poController.updatePurchaseRequestLine)
router.patch('/update-po/:id', poController.updatePurchaseOrder)
router.patch('/update-po-line/:id', poController.updatePurchaseOrderLine)

router.delete('/delete-pr-line/:id', poController.deletePurchaseRequestLine)
router.delete('/delete-po-line/:id', poController.deletePurchaseOrderLine)
router.delete('/delete-po/:id', poController.deletePurchaseOrder)

router.post(
    '/bulk-update-po-receipt-date',
    poController.bulkUpdateReceiptDate
)

router.post('/create-used-qty-transaction', poController.createUsedQuantityTransaction)
router.get('/get-used-qty-transactions/:line_id', poController.getUsedQuantityTransactionsByLine)
router.get('/get-used-qty-transactions-bulk', poController.getUsedQuantityTransactionsByLines)
router.get('/get-backup-po-report', poController.getBackupPOReport)
router.patch('/update-used-qty-transaction/:id', poController.updateUsedQuantityTransaction)

router.delete('/delete-used-qty-transaction/:id', poController.deleteUsedQuantityTransaction)

module.exports = router
