const mongoose = require('mongoose');
const { Schema } = mongoose;

const blogSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
   createdAt: {
        type: Date,
        default: Date.now,
    },

    image: {
        type: String,
        default: null,
    },
})

const Blog = mongoose.model('Blog', blogSchema);
module.exports = Blog;