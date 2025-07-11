import mongoose from "mongoose";
import { redis } from "../lib/redis.js";
import Product from "../model/product.model.js";


export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find({}).lean()
        if(!products) return res.status(404).json({message: "NO products found"})
        res.status(200).json(products)
    } catch (err) {
        console.log("error in get all products controller", err.message)
        res.status(500).json({message: "server error", error: err.message})
    }
}

export const getFeaturedProducts = async (req, res) => {
    try {
       let featuredProducts = await redis.get('featuredProducts')

       if(featuredProducts) return res.json(JSON.parse(featuredProducts))
       
       // if not in redis
       featuredProducts = await Product.find({isFeatured: true}).lean() ;
       if(!featuredProducts) return res.status(404).json({message: "NO featured products"})

       // for future get quick response from redis
       await redis.set('featuredProducts', JSON.stringify(featuredProducts))

       res.status(200).json(featuredProducts)

    } catch (err) {
       console.log("error in feature products controller", err.message)
       res.status(500).json({message: "server error", error: err.message})
    }
}

export const createProduct = async (req, res) => {
    try {
        const {name, price, description, image, category} = req.body

        const product = await Product.create({name, price, description, image, category})
        res.status(201).json(product)                   
    } catch (err) {
        console.log("error in create product controller", err.message)
        res.status(500).json({message: "server error", error: err.message})
    }
}

export const deleteProduct = async (req, res) => {
    try {
        const {id} = req.params
        if(!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({message: "invalid product id"})
        const product = await Product.findByIdAndDelete(id)
        if(!product) return res.status(404).json({message: "product not found"})
        res.status(200).json({message: "product deleted successfully"})
    } catch (err) {
        console.log("error in delete product controller", err.message)
        res.status(500).json({message: "server error", error: err.message})
    }
}

export const toggleFeaturProduct = async (req, res) => {   
    try {
        const {id} = req.params
        if(!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({message: "invalid product id"})
        const product = await Product.findById(id)
        if(!product) return res.status(404).json({message: "product not found"})
        product.isFeatured = !product.isFeatured
        await product.save()
        await updateFeatureProductCache(); // update cache after toggling feature product
        res.status(200).json({message: "product updated successfully", product})
    } catch (err) {
        console.log("error in toggle feature product controller", err.message)
        res.status(500).json({message: "server error", error: err.message})
    }
}

export const clearCache = async (req, res) => {
    try {
        await redis.del('featuredProducts')
        res.status(200).json({message: "cache cleared successfully"})
    } catch (err) {
        console.log("error in clear cache controller", err.message)
        res.status(500).json({message: "server error", error: err.message})
    }
}
export const getProductById = async (req, res) => {
    try {
        const {id} = req.params
        if(!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({message: "invalid product id"})
        const product = await Product.findById(id).lean()
        if(!product) return res.status(404).json({message: "product not found"})
        res.status(200).json(product)
    } catch (err) {
        console.log("error in get product by id controller", err.message)
        res.status(500).json({message: "server error", error: err.message})
    }
}   

export const updateProduct = async (req, res) => {
    try {
        const {id} = req.params
        if(!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({message: "invalid product id"})
        const product = await Product.findByIdAndUpdate(id, req.body, {new: true}).lean()
        if(!product) return res.status(404).json({message: "product not found"})
        res.status(200).json(product)
    } catch (err) {
        console.log("error in update product controller", err.message)
        res.status(500).json({message: "server error", error: err.message})
    }
} 

async function updateFeatureProductCache() {   
    try {
        const featuredProducts = await Product.find({isFeatured: true}).lean()
        if(!featuredProducts) return
        await redis.set('featuredProducts', JSON.stringify(featuredProducts))
    } catch (err) {
        console.log("error in update feature product cache", err.message)
    }
}

// async function imageStoreinAsset(image) {

//     try {
       

    
//         }

//         // Return the relative path for storage in the database
       
//     } catch (err) {
//         console.error("Error in imageStoreinAsset:", err.message);
//         return null;
//     }
// }
