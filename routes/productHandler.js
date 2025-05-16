const express = require('express');
const { createProduct, getProductByName, getProducts, getAllPurchase, purchaseProduct, getSinglePurchase, editProducts, deleteProducts } = require('../controller/product.controller');
const { authMiddleware, isAdmin } = require('../middlewares/authentication');
const upload  = require('../middlewares/multer');

const router = express.Router();





router.get("/", getProducts);
router.post("/create", upload.single('image'), [authMiddleware, isAdmin], createProduct);
router.get("/:name", getProductByName);
router.patch('/:id', [authMiddleware, isAdmin], editProducts)
router.delete('/:id', [authMiddleware, isAdmin], deleteProducts)
router.post('/purchase', purchaseProduct)
router.get('/purchase/all-purchase', getAllPurchase)
router.get('/single-product/:name', getProductByName)
router.get('/purchase/single-purchase/:reference', getSinglePurchase)

module.exports = router;