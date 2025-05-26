const Product = require('../models/Product');
const User = require('../models/User');
const streamifier = require('streamifier');

const dotenv = require('dotenv');
dotenv.config();
const cloudinary = require('../utils/cloudinary');
const Purchase = require('../models/Purchase');
const { default: Redis } = require('ioredis');


//////--------------------------------- Create Product -------------------------------//////////////////

const createProduct = async (req, res)=>{
    try {
        const {name, description, price, spec} = req.body;
       

        // Validate input

        if (!name || !description || !req.file || !spec || !price) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if (name.length < 5) {
            return res.status(400).json({ message: "Product title must be at least 5 characters long" });
        }
        if (description.length < 10) {
            return res.status(400).json({ message: "Description must be at least 10 characters long" });
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
        
       

       
        const newProduct = new Product({
            name,
            description,
            image: result.secure_url,
            price, 
            spec
        })
        
        

        await newProduct.save();
        
        return res.status(201).json({ message: "Product created successfully", product: newProduct });
        
        
    } catch (error) {
        console.error("Error creating product:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

//////--------------------------------- Get All Product -------------------------------//////////////////


const getProducts = async (req, res) => {
    try {

      const cachedProducts = await Redis.get('products');
      if (cachedProducts) {
        return res.status(200).json(JSON.parse(cachedProducts));
      }
        const product = await Product.find().sort({ createdAt: -1 }) 
        
        await Redis.set('products', JSON.stringify(product), 'EX', 3600);
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}

const getProductByName = async (req, res) => {
    try {
        const { name } = req.params;

        const product = await Product.findOne({name})
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
       
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}

//////--------------------------------- Purchase Product -------------------------------//////////////////

const purchaseProduct = async (req, res) => {
  try {
    const { reference, productId, email, phone } = req.body;

    if (!reference || !productId || !email || !phone ) {
      return res.status(400).json({ error: "All fields are required!" });
    }

    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
    });

    if (!response.ok) {
      return res.status(400).json({ error: "Unable to verify transaction" });
    }

    const { data } = await response.json();

    if (data.status !== 'success') {
      return res.status(400).json({ message: "Payment not successful" });
    }

    // Check if transaction already processed
    const exists = await Purchase.findOne({ reference });
    if (exists) {
      return res.status(409).json({ message: "Transaction already processed" });
    }

    const amount = data.amount / 100; // Convert from kobo to Naira

    // Create purchase record
    const purchase = await Purchase.create({
      userEmail: email,
      phone,
      product: productId,
      total: amount,
      status: 'paid',
      reference,
    });

    return res.status(200).json({ message: "Payment verified", purchase });

  } catch (error) {
    console.error("Purchase error:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

//////--------------------------------- Get all purchased Product -------------------------------//////////////////


const getAllPurchase = async (req, res) => {
    try {
      const purchases = await Purchase.find().populate('product').sort({ createdAt: -1 }); // Optional: populate product info
      return res.status(200).json({
        message: "Purchases fetched successfully",
        count: purchases.length,
        purchases
      });
    } catch (error) {
      console.error("Error fetching purchases:", error.message);
      return res.status(500).json({ error: "Internal server error" });
    }
  };
  
//////--------------------------------- Get single purchased Product -------------------------------//////////////////

  const getSinglePurchase = async (req, res) => {
    try {
      const { reference } = req.params;
  
      if (!reference) {
        return res.status(400).json({ error: "Reference number is required" });
      }
  
      const purchase = await Purchase.findOne({ reference }).populate('product'); // Optional: populate product
  
      if (!purchase) {
        return res.status(404).json({ error: "No purchase record found for this reference number" });
      }
  
      return res.status(200).json({ message: "Purchase fetched successfully", purchase });
  
    } catch (error) {
      console.error("Error fetching purchase:", error.message);
      return res.status(500).json({ error: "Internal server error" });
    }
  };
  
//////--------------------------------- Edit Product -------------------------------//////////////////

const editProducts = async (req, res)=>{
  try {
    const {id} = req.params
  const product = await Product.findById(id)
  if(!product) return res.status(404).json({error: "Product not found"})
  
  const updatedProduct = await Product.findByIdAndUpdate(id, req.body, {new: true, runValidators: true})
  await Redis.del('products'); // Clear cache after update
  return res.status(200).json({message: "Product updated Successfully", updatedProduct})
  } catch (error) {
    return res.status(500).json({ error: "Server error", details: error.message });
  }
  
}

//////--------------------------------- Delete Product -------------------------------//////////////////
const deleteProducts = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    await Product.findByIdAndDelete(id);
    await Redis.del('products'); // Clear cache after deletion
    return res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Server error", details: error.message });
  }
};


module.exports = {
    createProduct,
    getProducts,
    getProductByName,
    getAllPurchase,
    purchaseProduct,
    getSinglePurchase,
    editProducts,
    deleteProducts

}