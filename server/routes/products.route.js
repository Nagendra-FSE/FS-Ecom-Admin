import express from "express";
import * as productsController from "../controller/products.controller.js"
import {protectRoute, adminRoute} from "../middleware/auth.middleware.js"

const router = express.Router();
router.get("/", protectRoute, adminRoute, productsController.getAllProducts);
router.get("/featured", productsController.getFeaturedProducts);
router.post("/", protectRoute, adminRoute, productsController.createProduct);
router.delete("/:id", protectRoute, adminRoute, productsController.deleteProduct);
router.patch("/:id", protectRoute, adminRoute, productsController.toggleFeaturProduct);

export default router;