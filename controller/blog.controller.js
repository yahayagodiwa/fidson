const Blog = require('../models/Blog');
const User = require('../models/User');

const createPost = async (req, res)=>{
    try {
        const {title, content, email } = req.body;

        if (!title || !content || !email) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if (title.length < 5) {
            return res.status(400).json({ message: "Title must be at least 5 characters long" });
        }
        if (content.length < 10) {
            return res.status(400).json({ message: "Content must be at least 10 characters long" });
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            return res.status(400).json({ message: "Email is not valid" });
        }
        
        // Check if user exists
        const existingUser = await User.findOne({
            email
        })

        if (!existingUser) {
            return res.status(400).json({ message: "User does not exist" });
        }

        // Create new blog post
        const newPost = new Blog({
            title,
            content,
        })
        newPost.author = existingUser._id; // Set the author to the user's ID

        await newPost.save();
        existingUser.posts.push(newPost._id); // Add the post ID to the user's posts array
        await existingUser.save(); // Save the user with the updated posts array

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