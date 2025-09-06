require('@dotenvx/dotenvx').config()
const morgan = require('morgan')
const express = require('express')
const helmet = require('helmet')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')

const app = express()
app.use(express.json())
app.use(bodyParser.json({ limit: '1mb', type: 'application/json' }))
app.use(bodyParser.urlencoded({ extended: true, limit: '1mb' }))
app.use(helmet())
app.use(morgan('tiny'))

//Routes
app.use('/api', require('./routes/masterData.js'))
app.use('/api', require('./routes/poRoute.js'))

const port = process.env.PORT || 5000
const uri = process.env.MONGO_URI

const start = async () => {
    try {
        await mongoose.connect(uri)
        console.log('MongoDB connected')
        app.listen(port, () => {
            console.log('Server is listening on port', port)
        })
    } catch (err) {
        console.log('Error:', err)
    }
}

start()
