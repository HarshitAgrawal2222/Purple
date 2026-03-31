import Address from "../models/Address.js";

// ADD ADDRESS
export const addAddress = async (req, res) => {
    try {
        const userId = req.userId; // ✅ FIX
        const addressData = req.body;

        if (!addressData) {
            return res.json({ success: false, message: "No data received" });
        }

        await Address.create({
            userId,
            ...addressData
        });

        res.json({ success: true, message: "Address Added Successfully" });

    } catch (error) {
        console.log("ADD ADDRESS ERROR:", error); // 👈 VERY IMPORTANT
        res.json({ success: false, message: error.message });
    }
};


// GET ADDRESS
export const getAddress = async (req, res) => {
    try {
        const userId = req.userId; // ✅ FIX

        const addresses = await Address.find({ userId });

        res.json({ success: true, addresses });

    } catch (error) {
        console.log("GET ADDRESS ERROR:", error);
        res.json({ success: false, message: error.message });
    }
};