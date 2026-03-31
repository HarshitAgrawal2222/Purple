import { v2 as cloudinary } from "cloudinary";
import Product from "../models/Product.js";
import path from "path";     // ✅ ADD
import fs from "fs";         // ✅ ADD

// Add Product
export const addProduct = async (req, res) => {
  try {
    const productData = req.body;
    const images = req.files;

    console.log("BODY:", productData);
    console.log("FILES:", images);

    if (!images || images.length === 0) {
      return res.json({ success: false, message: "No images received" });
    }

    // ✅ FIXED IMAGE UPLOAD
    let imgesUrl = await Promise.all(
      images.map(async (item) => {

        const result = await cloudinary.uploader.upload(
          path.resolve(item.path), // ✅ FIX
          { resource_type: "image" }
        );

        fs.unlinkSync(item.path); // ✅ DELETE LOCAL FILE

        return result.secure_url;
      })
    );

    await Product.create({
      ...productData,
      image: imgesUrl,
    });

    res.json({ success: true, message: "Product Added" });

  } catch (error) {
    console.log("ERROR:", error);
    return res.json({ success: false, message: error.message });
  }
};

// Product List
export const productList = async (req, res) => {
  try {
    const products = await Product.find({});
    res.json({ success: true, products });
  } catch (error) {
    console.log("FULL ERROR:", error);
    console.log("STACK:", error.stack);
    return res.json({ success: false, message: error.message });
  }
};

// Product By Id
export const productById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, product });

  } catch (error) {
    console.log(error.message);
    return res.json({ success: false, message: error.message });
  }
};

// Change Stock
export const changeStock = async (req, res) => {
  try {
    const { id, inStock } = req.body;

    const product = await Product.findByIdAndUpdate(
      id,
      { $set: { inStock } },
      { new: true }
    );

    res.json({ success: true, message: "Stock Updated", product });

  } catch (error) {
    console.log(error.message);
    return res.json({ success: false, message: error.message });
  }
};