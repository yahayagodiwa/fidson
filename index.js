const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const connectDB = require('./db/connectDB');
const User = require('./models/User');
const authRoutes = require('./routes/handler');
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






app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectDB();
})