import Home from './pages/App.js'
import { Routes, Route, BrowserRouter } from 'react-router'
import { useState, useEffect } from 'react'
import Product from './pages/Product.js'
import Partner from './pages/Partner.js'
import Uom from './pages/Uom.js'
import PurchaseRequest from './pages/PurchaseRequest.js'
import { useZustand } from './zustand.js'
import axios from 'axios'
import PurchaseRequestSequence from './pages/PurchaseRequestSequence.js'
import PurchaseOrder from './pages/PurchaseOrder.js'
import BackupPurchaseOrder from './pages/BackupPurchaseOrder.js'
import Contract from './pages/Contract.js'
import Brand from './pages/Brand.js'
import Bundle from './pages/Bundle.js'
import Packing from './pages/Packing.js'

const Main = () => {
    const [loading, setLoading] = useState(false)
    const {
        setPartnerState,
        setProductState,
        setUomState,
        setPrState,
        setPrSequenceState,
        setPoState,
        setBackupPoState,
        setContractState,
        setBrandState,
        setBundleState,
        setPackingState,
    } = useZustand()

    const handleFetchData = async () => {
        try {
            setLoading(true)
            const result = await Promise.all([
                axios.get('/api/get-partners'),
                axios.get('/api/get-products'),
                axios.get('/api/get-uoms'),
                axios.get('/api/get-prs'),
                axios.get('/api/get-pr-sequences'),
                axios.get('/api/get-pos'),
                axios.get('/api/get-pos?is_backup=true'),
                axios.get('/api/get-contracts'),
                axios.get('/api/get-brands'),
                axios.get('/api/get-bundles'),
                axios.get('/api/get-packings'),
            ])

            setPartnerState(result[0].data.data)
            setProductState(result[1].data.data)
            setUomState(result[2].data.data)
            setPrState(result[3].data.data)
            setPrSequenceState(result[4].data.data)
            setPoState(result[5].data.data)
            setBackupPoState(result[6].data.data)
            setContractState(result[7].data.data)
            setBrandState(result[8].data.data)
            setBundleState(result[9].data.data)
            setPackingState(result[10].data.data)
        } catch (error) {
            console.log(error)
            alert(error?.response?.data?.msg || error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        handleFetchData()
    }, [])

    if (loading) return <span>Loading...</span>
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />}>
                    <Route path="" element={<Product />} />
                    <Route path="partner" element={<Partner />} />
                    <Route path="uom" element={<Uom />} />
                    <Route
                        path="purchase-request"
                        element={<PurchaseRequest />}
                    />
                    <Route
                        path="purchase-request-sequence"
                        element={<PurchaseRequestSequence />}
                    />
                    <Route path="purchase-order" element={<PurchaseOrder />} />
                    <Route
                        path="backup-purchase-order"
                        element={<BackupPurchaseOrder />}
                    />
                    <Route path="contract" element={<Contract />} />
                    <Route path="brand" element={<Brand />} />
                    <Route path="bundle" element={<Bundle />} />
                    <Route path="packing" element={<Packing />} />
                </Route>
            </Routes>
        </BrowserRouter>
    )
}

export default Main
