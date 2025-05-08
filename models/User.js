const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    email:{
        type: String,
        required: true,
        unique:[true , 'Email already exists'],
        lowercase: true,

    },
    password:{
        type: String,
        required: true,
    },
    posts:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Blog',
    }],
    createdAt:{
        type: Date,
        default: Date.now,
    },
    role:{
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    isActive:{
        type: Boolean,
        default: true,
    },
    isBlocked:{
        type: Boolean,
        default: false,
    },
    isVerified:{
        type: Boolean,
        default: false,
    },
    resetToken:{
        type: String,
        default: null,
    },
    resetTokenExpiry:{
        type: Date,
        default: null,
    },
})

const User = mongoose.model('User', userSchema);

module.exports = User;
// This code defines a Mongoose schema and model for a User entity in a MongoDB database. The User schema includes three fields: name, email, and password, all of which are required. The email field is also unique, meaning no two users can have the same email address. The User model is then exported for use in other parts of the application.