const express = require('express');
const { createProduct, getProductByName, getProducts, getAllPurchase, purchaseProduct, getSinglePurchase } = require('../controller/product.controller');
const { authMiddleware, isAdmin } = require('../middlewares/authentication');
const upload  = require('../middlewares/multer');

const router = express.Router();





router.get("/", getProducts);
router.post("/create", upload.single('image'), [authMiddleware, isAdmin], createProduct);
router.get("/:name", getProductByName);
router.post('/purchase', purchaseProduct)
router.get('/purchase/all-purchase', getAllPurchase)
router.get('/single-product/:name', getProductByName)
router.get('/purchase/single-purchase/:reference', getSinglePurchase)

module.exports = router;