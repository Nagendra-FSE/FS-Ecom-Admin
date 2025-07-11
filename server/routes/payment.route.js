import express from "express";
import * as paymentController from "../controller/payment.controller.js"
import {protectRoute } from "../middleware/auth.middleware.js"

const router = express.Router();

router.post("/create-checkout-session", protectRoute, paymentController.createCheckoutSession);
router.post("/create-checkout-session", protectRoute, paymentController.checkoutSuccess);



export default router;