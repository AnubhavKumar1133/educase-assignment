import express from 'express'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import schoolRoutes from './routes/schoolRoutes.js'

const app = express()
const PORT = process.env.PORT || 5000

// Get the file path from the URL of the current module
const __filename = fileURLToPath(import.meta.url)
// Get the directory name from the file path
const __dirname = dirname(__filename)

// Middleware
app.use(express.json())


// Serving up the HTML file from the /public directory
app.get('/', (req, res) => {
    res.send(`Welcome to the edunext API`)
})

// Routes
app.use('/school', schoolRoutes);

app.listen(PORT, () => {
    console.log(`Server has started on port: ${PORT}`)
})