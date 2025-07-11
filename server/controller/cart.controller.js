import Product from "../model/product.model.js";


export const addToCart = async (req, res) => {
    try {
        const { productId } = req.body;   // Assuming productId and quantity are sent in the request body     
        const user = req.user; // Assuming you have user ID from the auth middleware
        const existingItem = user.cartItems.find((item) => item.id === productId)
        if(existingItem) {
            existingItem.quantity += 1; // Increment quantity if item already exists in cart
        } else {
            user.cartItems.push(productId); // Add new item to cart
        }
        await user.save(); // Save the updated cart to the database
        res.status(200).json({ message: "Item added to cart successfully", cartItems: user.cartItems });
    } catch (err) {
        console.error("Error adding to cart:", err.message);
        res.status(500).json({ message: "Server error", error: err.message });
    }
}
export const getCarts = async (req, res) => {
    try {
        const products = await Product.find({ _id: { $in: req.user.cartItems } }); // Fetch products from the database using cartItems
        const cartItems =  products.map((product) => {
            const item = req.user.cartItems.find((item) => item.id === product.id); // Find product details in the cart
            return {
                ...product.toJSON(), // Convert product to JSON format
                quantity: item.quantity || 1, // Set default quantity to 1 if not specified
            };
        })
        res.json({ cartItems } ); // Send the cart items as response

    } catch (err) {
        console.error("Error fetching cart:", err.message);
        res.status(500).json({ message: "Server error", error: err.message });
    }
}

export const removeAllFromCart = async (req, res) => {
    try {
        const { productId } = req.body;  // Assuming productId is sent in the request body
        const user = req.user; // Assuming you have user ID from the auth middleware              
        if(!productId) {
            user.cartItems = []; // Clear all items if no productId is provided
        } else {
            user.cartItems = user.cartItems.filter((item) => item.id !== productId); // Remove item from cart
        }
        // Clear the cart for the user
        await user.save(); // Save the updated cart to the database
        res.status(200).json({ message: "Cart cleared successfully" });
    } catch (err) {
        console.error("Error clearing cart:", err.message);
        res.status(500).json({ message: "Server error", error: err.message });
    }
}

export const updateQuntity = async (req, res) => {
    try {
        const { id: productId}= req.params; // Assuming productId is sent in the request params
        const {  quantity } = req.body; // Assuming productId and quantity are sent in the request body
        const user = req.user; // Assuming you have user ID from the auth middleware
        const existingItem = user.cartItems.find((item) => item.id === productId)
        if(existingItem) {
            if(quantity === 0) {
                user.cartItems = user.cartItems.filter((item) => item.id !== productId); // Remove item from cart if quantity is 0
                await user.save(); // Save the updated cart to the database
                return res.status(200).json({ message: "Item removed from cart", cartItems: user.cartItems });
            } else {
                existingItem.quantity = quantity; // Update quantity if item already exists in cart
            }
        } else {
            return res.status(404).json({ message: "Item not found in cart" });
        }
        await user.save(); // Save the updated cart to the database
        res.status(200).json({ message: "Cart updated successfully", cartItems: user.cartItems });
    } catch (err) {
        console.error("Error updating cart:", err.message);
        res.status(500).json({ message: "Server error", error: err.message });
    }
}