const express = require('express');
const { register, login, getUser, updateUserRole, editUserProfile, forgotPassword, resetPassword, verifyEmail } = require('../controller/auth.controller');
const { createPost, getPosts, getPostById } = require('../controller/blog.controller');
const { authMiddleware, isAdmin } = require('../middlewares/authentication');
const upload  = require('../middlewares/multer');
// const { isBlocked } = require('../middlewares/authorization');

const router = express.Router();




router.post("/api/register", register);
router.post("/api/login", login);
router.get("/api/posts", getPosts);
router.post("/api/post", upload.single('image'), [authMiddleware, isAdmin], createPost);
router.get("/api/user/:email", authMiddleware, getUser);
router.get("/api/post/:id", getPostById);
router.patch("/api/edit-profile", [authMiddleware, isAdmin], editUserProfile);
router.post("/api/forget-password",  forgotPassword);
router.post("/api/reset-password/:token", resetPassword);
router.get("/api/verify-email/:id", verifyEmail)

module.exports = router;