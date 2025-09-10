const express = require('express')
const router = express.Router()
const masterDataCtrl = require('../controller/masterDataController.js')

router.get('/get-partners', masterDataCtrl.getPartners)
router.get('/get-products', masterDataCtrl.getProducts)
router.get('/get-uoms', masterDataCtrl.getUoms)
router.get('/get-contracts', masterDataCtrl.getContracts)

router.post('/create-partner', masterDataCtrl.createPartner)
router.post('/create-product', masterDataCtrl.createProduct)
router.post('/create-uom', masterDataCtrl.createUom)
router.post('/create-contract', masterDataCtrl.createContract)

router.patch('/update-partner/:id', masterDataCtrl.updatePartner)
router.patch('/update-product/:id', masterDataCtrl.updateProduct)
router.patch('/update-uom/:id', masterDataCtrl.updateUom)
router.patch('/update-contract/:id', masterDataCtrl.updateContract)

module.exports = router
