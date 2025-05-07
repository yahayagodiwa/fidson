const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const connectString = process.env.MONGODB_URI;

const connectDB = async () => {
    try {
        await mongoose.connect(connectString);
        console.log('MongoDB connected');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
}

module.exports = connectDB;