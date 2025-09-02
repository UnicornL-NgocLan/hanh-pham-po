const express = require('express')
const router = express.Router()
const masterDataCtrl = require('../controller/masterDataController.js')

router.get('/api/get-partners', masterDataCtrl.getPartners)
router.get('/api/get-products', masterDataCtrl.getProducts)
router.get('/api/get-uoms', masterDataCtrl.getUoms)

router.post('/api/create-partner', masterDataCtrl.createPartner)
router.post('/api/create-product', masterDataCtrl.createProduct)
router.post('/api/create-uom', masterDataCtrl.createUom)

router.patch('/api/update-partner/:id', masterDataCtrl.updatePartner)
router.patch('/api/update-product/:id', masterDataCtrl.updateProduct)
router.patch('/api/update-uom/:id', masterDataCtrl.updateUom)

module.exports = router
