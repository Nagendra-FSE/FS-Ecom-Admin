import Coupan from "../model/coupan.model.js";

export const getCoupan = async (req, res) => {
    try {
        const { code, discount, expiryDate } = req.body; // Assuming code, discount, and expiryDate are sent in the request body
        const user = req.user; // Assuming you have user ID from the auth middleware

        // Check if the coupan already exists for the user
        const coupan = await Coupan.findOne({ user: user._id, isActive: true });
        res.json(coupan || null);
    } catch (err) {
        console.error("Error fetching coupan:", err.message);
        res.status(500).json({ message: "Server error", error: err.message });
    }
}

export const createCoupan = async (req, res) => {
    try {
        const { code, discount, expiryDate } = req.body; // Assuming code, discount, and expiryDate are sent in the request body
        const user = req.user; // Assuming you have user ID from the auth middleware

        // Check if the coupan already exists for the user
        const existingCoupan = await Coupan.findOne({ user: user._id, isActive: true });
        if (existingCoupan) {
            return res.status(400).json({ message: "Coupan already exists for this user" });
        }

        // Create a new coupan
        const newCoupan = new Coupan({
            code,
            discount,
            expiryDate,
            user: user._id
        });

        await newCoupan.save();
        res.status(201).json(newCoupan);
    } catch (err) {
        console.error("Error creating coupan:", err.message);
        res.status(500).json({ message: "Server error", error: err.message });
    }
}

export const validateCoupan = async (req, res) => {
    try {
        const { code } = req.body; // Assuming code is sent in the request body
        const user = req.user; // Assuming you have user ID from the auth middleware

        // Find the coupan by code and check if it's active and not expired
        const coupan = await Coupan.findOne({ code, user: user._id, isActive: true });
        if (!coupan) {
            return res.status(400).json({ message: "coupan not found" });
        }

        // Check if the coupan is expired
        if (new Date(coupan.expiryDate) < new Date()) {
            coupan.isActive
            await coupan.save(); // Mark the coupan as inactive if expired
            return res.status(400).json({ message: "Coupan has expired" });
        }

        res.json({message: "Coupan is valid", discount: coupan.discount });
    } catch (err) {
        console.error("Error validating coupan:", err.message);
        res.status(500).json({ message: "Server error", error: err.message });
    }
}