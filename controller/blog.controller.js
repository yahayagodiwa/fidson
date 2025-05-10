const Blog = require('../models/Blog');
const User = require('../models/User');
const streamifier = require('streamifier');
const dotenv = require('dotenv');
dotenv.config();
const cloudinary = require('../utils/cloudinary');

const createPost = async (req, res)=>{
    try {
        const {title, content} = req.body;
       

        // Validate input

        if (!title || !content || !req.file) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if (title.length < 5) {
            return res.status(400).json({ message: "Title must be at least 5 characters long" });
        }
        if (content.length < 10) {
            return res.status(400).json({ message: "Content must be at least 10 characters long" });
        }

        // grab image from request

        const postImage = req.file ? req.file.path : null; // Assuming you're using multer for file uploads
        if (postImage) {
            // Validate image type and size if needed
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
            const fileSizeLimit = 5 * 1024 * 1024; // 5MB

            if (!allowedTypes.includes(req.file.mimetype)) {
                return res.status(400).json({ message: "Invalid image type" });
            }
            if (req.file.size > fileSizeLimit) {
                return res.status(400).json({ message: "Image size exceeds limit" });
            }
        }

        
        const streamUpload = (buffer) => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream({
                    folder: "blog",
                    width: 500,
                    crop: "scale",
                }, (error, result) => {
                    if (result) {
                        resolve(result);
                    } else {
                        reject(error);
                    }
                });
                streamifier.createReadStream(buffer).pipe(stream);
            });
        };
        const result = await streamUpload(req.file.buffer);
        
       

        // Create new blog post
        const newPost = new Blog({
            title,
            content,
            image: result.secure_url,
        })
        newPost.author = req.user._id; // Set the author to the logged-in user
        

        await newPost.save();
        // Add the post to the author's posts array
        const author = await User.findById(req.user._id);
        author.posts.push(newPost._id);
        await author.save();

        return res.status(201).json({ message: "Blog post created successfully", post: newPost });
        
        
    } catch (error) {
        console.error("Error creating blog post:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}


const getPosts = async (req, res) => {
    try {
        const posts = await Blog.find().populate('author', 'name email'); // Populate author field with user details
        res.status(200).json(posts);
    } catch (error) {
        console.error("Error fetching blog posts:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const getPostById = async (req, res) => {
    try {
        const { id } = req.params;
        const post = await Blog.findById(id).populate('author', 'name email'); // Populate author field with user details
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        res.status(200).json(post);
    } catch (error) {
        console.error("Error fetching blog post:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

module.exports = {
    createPost,
    getPosts,
    getPostById,
}