import express from 'express';
import { upload } from '../configs/multer.js';
import authSeller from '../middlewares/authSeller.js';
import { addProduct, changeStock, productById, productList } from '../controllers/productController.js';

const productRouter = express.Router();

// Add Product
productRouter.post(
  '/add',
  authSeller,
  upload.array("images"), // ✅ FIXED
  addProduct
);

// Get all products
productRouter.get('/list', productList);

// Get product by id (FIXED)
productRouter.get('/id/:id', productById);

// Change stock
productRouter.post('/stock', authSeller, changeStock);

export default productRouter;