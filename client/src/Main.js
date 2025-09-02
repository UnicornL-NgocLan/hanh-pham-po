import Home from './pages/App.js'
import { Routes, Route, BrowserRouter } from 'react-router'
import { useState, useEffect } from 'react'
import Product from './pages/Product.js'
import Partner from './pages/Partner.js'
import Uom from './pages/Uom.js'

const Main = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
              <Home />
          }
        >
          <Route path="" element={<Product/>} />
          <Route path="partner" element={<Partner/>} />
          <Route path="uom" element={<Uom/>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default Main