require('dotenv').config()
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const errorHandler = require('./middleware/errorMiddleware')
const connectDb = require('./config/dbConnection')
const authRoutes = require('./routes/auth.routes')
const userRoutes = require('./routes/user.routes')
const topicRoutes = require('./routes/topic.routes')
const reviewRoutes = require('./routes/review.routes')

const morgan = require('morgan')
const path = require('path')

const multer = require('multer')

const fs = require('fs')

const app = express()

app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(bodyParser.json({ limit: '50mb', extended: true }))
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }))
app.use(
  cors({
    origin: ['http://localhost:5173', 'https://www.staylunique.com'],
    credentials: true,
  })
)

app.use(
  '/categories',
  express.static(path.join(__dirname, 'public/categories'))
)

app.use('/products', express.static(path.join(__dirname, 'public/products')))

app.use('/sliders', express.static(path.join(__dirname, 'public/sliders')))

const productsStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/products')
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname)
  },
})

const cattegoryStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/categories')
  },
  filename: function (req, file, cb) {
    const filePath = 'public/categories/' + file.originalname

    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        cb(null, file.originalname)
      } else {
        cb(new Error('Bu isimde bir dosya zaten var. Başka Bir isim deneyin'))
      }
    })
  },
})

const sliderStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/sliders')
  },
  filename: function (req, file, cb) {
    const filePath = 'public/sliders/' + file.originalname

    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        cb(null, file.originalname)
      } else {
        cb(new Error('Bu isimde bir dosya zaten var. Başka Bir isim deneyin'))
      }
    })
  },
})

const uploadOne = multer({
  storage: productsStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
})
const uploadTwo = multer({ storage: cattegoryStorage })
const uploadThree = multer({ storage: sliderStorage })

// app.post('/create-product', uploadOne.array('pictures[]'), createProduct)
// app.patch('/update-product', updateProduct)

// app.post('/create-category', uploadTwo.single('img'), createCategory)
// app.post('/create-slider', uploadThree.single('img'), createSlider)

// app.put('/update-category', uploadTwo.single('img'), updateCategory)

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/topic', topicRoutes)
app.use('/api/review', reviewRoutes)

app.use(errorHandler)
connectDb()
const port = process.env.PORT

app.listen(port, () => {
  console.log(`Server listening on Port ${port}`)
})
