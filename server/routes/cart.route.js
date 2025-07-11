import express from "express";
import * as cartController from "../controller/cart.controller.js" 
import { protectRoute } from "../middleware/auth.middleware.js"

const router = express.Router();

router.get("/", protectRoute, cartController.getCarts);
router.post("/", protectRoute, cartController.addToCart);
router.delete("/", protectRoute, cartController.removeAllFromCart);
router.put("/:id", protectRoute, cartController.updateQuntity);


export default router;