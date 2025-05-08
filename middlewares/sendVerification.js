// send verification email
const nodemailer = require('nodemailer');
const User = require('../models/User');
const sendVerificationEmail = async (user) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD,
            },
        });
        const mailOptions = {
            from: process.env.EMAIL,
            to: user.email,
            subject: 'Verify your email',
            text: `Click the link to verify your email: ${process.env.FRONTEND_URL}/api/verify-email/${user._id}`,
        };
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error sending verification email:', error);
    }
}
        module.exports = { sendVerificationEmail };