import { stripe } from "../lib/stripe.js";
import Coupan from "../model/coupan.model.js";
import Order from "../model/order.model.js";

export const createCheckoutSession = async (req, res) => {
    try {
        const {products, coupanCode} = req.body;
        if(!Array.isArray(products) || products.length === 0) {
            return res.status(400).json({message: "No products found"})
        }
        let totalAmount = 0;        
        const line_items = products.map((product) => {
            const amount = product.price * 100; // Convert to cents
            totalAmount += amount * product.quantity; // Calculate total amount in cents
                return {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: product.name,
                            images: [product.image],
                        },
                        unit_amount: amount, // Convert to cents
                    },
                };
            });

            // Check if coupan code is valid and apply discount
            let coupan = null;
            if (coupanCode) {
                coupan = await Coupan.findOne({ code: coupanCode, user: req.user._id, isActive: true });     
                if (coupan && coupan.isActive && coupan.expiryDate > Date.now()) {
                    discount = (totalAmount * coupan.discount) / 100; // Calculate discount amount
                    totalAmount -= discount; // Apply discount to total amount
                } else {
                    return res.status(400).json({ message: "Invalid or expired coupon code" });
                }
            } 


            const session = await stripe.checkout.sessions.create({
                payment_method_types: ["card"],
                line_items,
                mode: "payment",
                success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.CLIENT_URL}/cancel`,
                discounts: coupan ? [{ coupon: await createStripeCoupan(coupan.discountPercentage  ) }] : [], // Apply discount if available
                metadata: {
                    userId: req.user._id.toString(),
                    coupanCode: coupan ? coupan.code : null,
                    totalAmount: totalAmount.toString(), // Store the total amount in metadata
                    products: JSON.stringify(products.map(p => ({id: p._id, quantity: p.quantity, price: p.price}))), // Store product details in metadata
                },
            });
           if(totalAmount > 100) {
                await createNewCoupan(req.user._id); // Create a new coupon for the user
            }
            res.status(200).json({ id: session.id, totalAmount: totalAmount / 100 }); // Send the session ID and total amount in the response  
        } catch (error) {
            res.status(500).json({message: error.message})
        }
    };

export const checkoutSuccess = async (req, res) => {
    try {
        const sessionId = req.query.session_id;
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if(session?.payment_status === "paid") {
           await Coupan.findOneAndUpdate(
            { code: session.metadata.coupanCode, user: session.metadata.userId },
            { $set: { isActive: false } }, // Mark the coupon as inactive
           )

           const newOrder = await Order.create({
                user: session.metadata.userId,
                products: JSON.parse(session.metadata.products), // Parse the products from metadata
                totalAmount: session.metadata.totalAmount, // Store the total amount in the order
                stripeSessionId: session.id, // Store the Stripe session ID in the order
                status: "Pending", // Set the initial order status
           })
              await newOrder.save(); // Save the order to the database
              res.status(200).json({ message: "Order created successfully", order: newOrder });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }    
}


    async function createStripeCoupan(discountPercentage) {
        try {
            const coupon = await stripe.coupons.create({
                percent_off: discountPercentage,
                duration: 'once',
            });
            return coupon.id;
        } catch (error) {
            console.error('Error creating Stripe coupon:', error);
            throw new Error('Failed to create coupon');
        }
    }

    async function createNewCoupan(userId) {
        try {
            const newCoupan = await Coupan.create({
                code: `COUPON-${Date.now()}`,
                discount: discountPercentage,
                expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
                isActive: true,
                user: userId,
            });
             await newCoupan.save(); // Save the coupon to the database

        } catch (error) {
            console.error('Error creating coupon:', error);
            throw new Error('Failed to create coupon');
        }
    }   