const User = require("../models/User")
const Blog = require("../models/Blog");

const updateUserRole = async (req, res) => {
    try {
        const { email, role } = req.body;
        if (!email || !role) {
            return res.status(400).json({ message: "Email and role are required" });
        }
    
        // Check if user exists
        const existingUser = await User.findOne({email});
        if (!existingUser) {
            return res.status(400).json({ message: "User does not exist" });
        }
    
        // Update user role
        existingUser.role = role;
        await existingUser.save();
    
        res.status(200).json({ message: "User role updated successfully", user: existingUser });
    } catch (error) {
        
        console.error("Error updating user role:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const deletePostByAdmin = async (req, res) => {

    try {
        const { postId } = req.params;
        if (!postId) {
            return res.status(400).json({ message: "Post ID is required" });
        }
    
        // Check if post exists
        const existingPost = await Blog.findById(postId);
        if (!existingPost) {
            return res.status(400).json({ message: "Post does not exist" });
        }
    
        // Delete post
        await Blog.findByIdAndDelete(postId);
    
        res.status(200).json({ message: "Post deleted successfully" });
    } catch (error) {
        
        console.error("Error deleting post:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

module.exports = {
    updateUserRole,
    deletePostByAdmin,

}