const User = require("../models/User");
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            return res.status(400).json({ message: "Email is not valid" });
        }
    
        // Check if user already exists
        const existingUser = await User.findOne({email});
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }
    
        // Create new user
    
        const newUser = new User({
            name,
            email,
            password,
        })

        await newUser.save();
    
        res.status(201).json({ message: "User registered successfully", user: newUser });
    } catch (error) {
        
        console.error("Error registering user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            return res.status(400).json({ message: "Email is not valid" });
        }
    
        // Check if user exists
        const existingUser = await User.findOne({email});
        if (!existingUser) {
            return res.status(400).json({ message: "User does not exist" });
        }
    
        // Check password
        if (existingUser.password !== password) {
            return res.status(400).json({ message: "Invalid password" });
        }
    
        res.status(200).json({ message: "User logged in successfully", user: existingUser });
    } catch (error) {
        
        console.error("Error logging in user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const getUser = async (req, res) => {
    try {
        const email  = req.params.email
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        
        if (!/\S+@\S+\.\S+/.test(email)) {
            return res.status(400).json({ message: "Email is not valid" });
        }
    
        // Check if user exists
        const existingUser = await User.findOne({email}).select("-password").populate('posts').sort({ createdAt: -1 });
        // .populate('posts', 'title content createdAt'); // Populate posts field with blog post details
        
        if (!existingUser) {
            return res.status(400).json({ message: "User does not exist" });
        }


    
        res.status(200).json({ message: "User fetched successfully", user: existingUser });
    } catch (error) {
        
        console.error("Error fetching user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

module.exports = {
    register,
    login,
    getUser,
}