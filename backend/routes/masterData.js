const express = require('express')
const router = express.Router()
const masterDataCtrl = require('../controller/masterDataController.js')

router.get('/get-partners', masterDataCtrl.getPartners)
router.get('/get-products', masterDataCtrl.getProducts)
router.get('/get-uoms', masterDataCtrl.getUoms)
router.get('/get-contracts', masterDataCtrl.getContracts)
router.get('/get-brands', masterDataCtrl.getBrands)
router.get('/get-bundles', masterDataCtrl.getBundles)
router.get('/get-packings', masterDataCtrl.getPackings)

router.post('/create-partner', masterDataCtrl.createPartner)
router.post('/create-product', masterDataCtrl.createProduct)
router.post('/create-uom', masterDataCtrl.createUom)
router.post('/create-contract', masterDataCtrl.createContract)
router.post('/create-brand', masterDataCtrl.createBrand)
router.post('/create-bundle', masterDataCtrl.createBundle)
router.post('/create-packing', masterDataCtrl.createPacking)

router.patch('/update-partner/:id', masterDataCtrl.updatePartner)
router.patch('/update-product/:id', masterDataCtrl.updateProduct)
router.patch('/update-uom/:id', masterDataCtrl.updateUom)
router.patch('/update-contract/:id', masterDataCtrl.updateContract)
router.patch('/update-brand/:id', masterDataCtrl.updateBrand)
router.patch('/update-bundle/:id', masterDataCtrl.updateBundle)
router.patch('/update-packing/:id', masterDataCtrl.updatePacking)

router.delete('/delete-product/:id', masterDataCtrl.deleteProduct)

module.exports = router
