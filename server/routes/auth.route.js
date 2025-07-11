import express from "express";
import * as authController from "../controller/auth.controller.js"
import { protectRoute } from "../middleware/auth.middleware.js"

const router = express.Router();

router.post("/signup", authController.signup);

router.post("/login", authController.login);

router.post("/logout", authController.logout);

router.post("/refresh-token", authController.refreshAccessToken);

router.get("/profile",  protectRoute, authController.getProfile);


export default router;