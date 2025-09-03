import Home from './pages/App.js'
import { Routes, Route, BrowserRouter } from 'react-router'
import { useState, useEffect } from 'react'
import Product from './pages/Product.js'
import Partner from './pages/Partner.js'
import Uom from './pages/Uom.js'
import { useZustand } from './zustand.js'
import axios from 'axios'

const Main = () => {
    const [loading, setLoading] = useState(false)
    const { setPartnerState, setProductState, setUomState } = useZustand()

    const handleFetchData = async () => {
        try {
            setLoading(true)
            const result = await Promise.all([
                axios.get('/api/get-partners'),
                axios.get('/api/get-products'),
                axios.get('/api/get-uoms'),
            ])

            setPartnerState(result[0].data.data)
            setProductState(result[1].data.data)
            setUomState(result[2].data.data)
        } catch (error) {
            alert(error?.response?.data?.msg)
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
                </Route>
            </Routes>
        </BrowserRouter>
    )
}

export default Main
