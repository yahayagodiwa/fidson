const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { sendVerificationEmail } = require("../middlewares/sendVerification");

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

        
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // check the first user in the database and set role to admin
        const firstUser = await User.findOne({}).sort({ createdAt: 1 });

        if (!firstUser) {
            const newUser = new User({
                name,
                email,
                password: hashedPassword,
                role: "admin",
            })

            await Promise.all([
                newUser.save(),
                sendVerificationEmail(newUser),
            ]);
            return res.status(201).json({ message: "User registered successfully", user: newUser });
        }

        // Create new user
    
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
        })

        await Promise.all([
            newUser.save(),
            sendVerificationEmail(newUser),
        ]);

    
        res.status(201).json({ message: "User registered successfully", user: newUser });
    } catch (error) {
        
        console.error("Error registering user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const verifyEmail = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ message: "User ID is required" });
    }

    // Check if user exists
    const existingUser = await User.findById(id);
    if (!existingUser) {
        return res.status(400).json({ message: "User does not exist" });
    }

    // Update user verification status
    existingUser.isVerified = true;
    await existingUser.save();

    return res.status(200).json({ message: "Email verified successfully" });
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

        // Check if user is blocked
        if (existingUser.isBlocked) {
            return res.status(403).json({ message: "Your account is permanently banned, contact admin" });
        }

        // Check if user is active
        if (!existingUser.isActive) {
            return res.status(403).json({ message: "Your account is not active, contact admin" });
        }


        // Check if user is verified
        if (!existingUser.isVerified) {
            return res.status(403).json({ message: "Your account is not verified, contact admin" });
        }
    
        // Check password
        const isMatch = await bcrypt.compare(password, existingUser.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Generate JWT token
        const token = jwt.sign({ id: existingUser._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        existingUser.password = undefined; // Remove password from user object  

    
        return res.status(200).json({ message: "User logged in successfully", user: existingUser, token });
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



const editUserProfile = async (req, res) => {
    const {_id} = req.user;

    if(req.body.email){
        const existingUser = await User.findOne({email: req.body.email});
        if (existingUser) {
            return res.status(400).json({ message: "Someone already using this email, pls try another one!" });
        }
    }

    const updatedUser = await User.findByIdAndUpdate(_id, req.body, {new: true, runValidators: true});
    if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ message: "User profile updated successfully", user: updatedUser });
}

const forgotPassword = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
        return res.status(400).json({ message: "Email is not valid" });
    }

    // Check if user exists
    const existingUser = await User.findOne({email});
    if (!existingUser) {
        return res.status(400).json({ message: "User does not exist" });
    }
    

    // Generate JWT token
    const token = jwt.sign({ id: existingUser._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    // set reset token and expiry time in user model
    existingUser.resetToken = token;
    existingUser.resetTokenExpiry = Date.now() + 3600000; // 1 hour expiry
    await existingUser.save();


    
    // Send email with reset link (not implemented here)

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'Password Reset Link',
        text: `Click the link to reset your password: ${process.env.FRONTEND_URL}/api/reset-password/${token}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return res.status(500).json({ message: "Error sending email" });
        } else {
            console.log('Email sent: ' + info.response);

            return res.status(200).json({ message: "Password reset link sent to your email" });
        }
    });
    
}

const resetPassword = async (req, res) => {
    const { newPassword } = req.body;
    const { token } = req.params; 
    if (!token || !newPassword) {
        return res.status(400).json({ message: "Token and new password are required" });
    }
    if (newPassword.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    // Verify token
    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Check if user exists
    const existingUser = await User.findById(decoded.id);
    if (!existingUser) {
        return res.status(400).json({ message: "User does not exist" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    existingUser.password = hashedPassword;
    existingUser.resetToken = null; // Clear reset token
    existingUser.resetTokenExpiry = null; // Clear reset token expiry

    

    await existingUser.save();

    return res.status(200).json({ message: "Password reset successfully" });
}

module.exports = {
    register,
    login,
    getUser,
    editUserProfile,
    forgotPassword,
    resetPassword,
    verifyEmail,
}