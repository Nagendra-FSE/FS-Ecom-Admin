import express from "express";
import * as coupanController from "../controller/coupan.controller.js" 
import { protectRoute } from "../middleware/auth.middleware.js"

const router = express.Router();

router.get("/", protectRoute, coupanController.getCoupan);
router.post("/validate", protectRoute, coupanController.validateCoupan);



export default router;