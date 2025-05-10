const express = require('express');
const { updateUserRole, deletePostByAdmin } = require('../controller/admin.controller');
const { authMiddleware } = require('../middlewares/authentication');
const { isAdmin } = require('../middlewares/authentication');
// const { createPost } = require('../controller/blog.controller');
const router = express.Router();


router.post("/api/update-user-role", [authMiddleware, isAdmin], updateUserRole);
router.delete("/api/delete-post/:postId", [authMiddleware, isAdmin], deletePostByAdmin);
// router.post("/api/post", [authMiddleware, isAdmin], createPost);

module.exports = router;