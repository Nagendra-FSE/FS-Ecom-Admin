import express from "express";
import * as analyticsController from "../controller/analytics.controller.js"
import {adminRoute, protectRoute } from "../middleware/auth.middleware.js"

const router = express.Router();

router.get("/", protectRoute, adminRoute, analyticsController.getAnalyticsData);



export default router;