const mongoose = require('mongoose');
const { Schema } = mongoose;

const productSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
   price: {
        type: Number,
        required: true
    },

    image: {
        type: String,
        default: null,
    },

    availability: {
        type: Boolean,
        required: true,
        default: true
    },
    spec: {
        type: String,
        required: true
    },
})

const Product = mongoose.model('Product', productSchema);
module.exports = Product;