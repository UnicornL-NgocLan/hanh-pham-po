const express = require('express')
const router = express.Router()
const poController = require('../controller/poController.js')

router.post('/create-pr', poController.createPurChaseRequest)
router.post('/create-pr-line', poController.createPurchaseRequestLine)

router.get('/get-prs', poController.getPurchaseRequests)
router.get('/get-pr-sequences', poController.getPurchaseRequestSequences)
router.get('/get-pr-lines/:order_id', poController.getPurchaseRequestLines)

router.patch(
    '/update-pr-sequence/:id',
    poController.updatePurchaseRequestSequence
)
router.patch('/update-pr/:id', poController.updatePurchaseRequest)
router.patch('/update-pr-line/:id', poController.updatePurchaseRequestLine)

router.delete('/delete-pr-line/:id', poController.deletePurchaseRequestLine)

module.exports = router
