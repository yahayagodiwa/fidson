const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const connectDB = require('./db/connectDB');
const User = require('./models/User');
const authRoutes = require('./routes/handler');
const adminRoutes = require('./routes/adminHandler');
const productRoutes = require('./routes/productHandler');
dotenv.config();
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;


// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(express.json());
app.use(cors({
    origin: "*"
}));

app.use("/", authRoutes);
app.use("/admin", adminRoutes);
app.use("/api/product", productRoutes);






app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectDB();
})