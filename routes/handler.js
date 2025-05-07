const express = require('express');
const { register, login, getUser } = require('../controller/auth.controller');
const { createPost, getPosts, getPostById } = require('../controller/blog.controller');

const router = express.Router();




router.post("/api/register", register);
router.post("/api/login", login);
router.post("/api/post", createPost);
router.get("/api/posts", getPosts);
router.get("/api/user/:email", getUser);
router.get("/api/post/:id", getPostById);

module.exports = router;