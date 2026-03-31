import User from "../models/User.js"

// Update User CartData : /api/cart/update

export const updateCart = async (req, res) => {
    try {
        const userId = req.userId; // ✅ from auth middleware
        const { cartItems } = req.body;

        await User.findByIdAndUpdate(userId, { cartItems });

        res.json({ success: true, message: "Cart Updated" });

    } catch (error) {
        console.log(error.message);
        return res.json({ success: false, message: error.message });
    }
};