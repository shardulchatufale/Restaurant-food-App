const ReastaurantModel = require("../Model/ReastaurantModel");
const UserModel = require("../Model/UserModel");
const mongoose = require('mongoose');
const qrcode = require('qrcode');

// Utility function to validate input
const isValid = (val) => {
    return !(typeof val === "undefined" || val === null || (typeof val === "string" && val.trim().length === 0));
};

// Create Restaurant Controller
const createRestaurant = async (req, res) => {
    try {
        const {
            title, imeageURL, foods, TimeRanges, pickup, delivery,
            isOpen, logoURL, rating, code, coords, time, ...rest
        } = req.body;

        // Check for extra fields
        if (Object.keys(rest).length > 0) 
            return res.status(400).json({ success: false, message: `Invalid fields provided: ${Object.keys(rest)}` });

        // Check for required fields
        if (Object.keys(req.body).length === 0 || !title || !imeageURL || !foods || !TimeRanges || !logoURL || !rating || !code || !coords)
            return res.status(400).json({ success: false, message: "All required fields must be provided" });

        if (!isValid(title))
            return res.status(400).json({ success: false, message: "Invalid or missing title" });
console.log("......29");

        // Food items validation
        const validCategories = ["Snacks", "Meal", "Breakfast"];
        for (let i = 0; i < foods.length; i++) {
            const { Dish_Name, Price, Category } = foods[i];

            if (!Dish_Name || typeof Dish_Name !== 'string')
                return res.status(400).json({ success: false, message: `Invalid Dish_Name in food item ${i + 1}` });

            if (!Price || typeof Price !== "number")
                return res.status(400).json({ success: false, message: `Invalid Price in food item ${i + 1}` });

            if (!Category || typeof Category !== 'string' || !validCategories.includes(Category))
                return res.status(400).json({ success: false, message: `Invalid Category in food item ${i + 1}. Valid categories are: ${validCategories.join(", ")}` });
        }

        // Check if user is an owner
        const user = await UserModel.findById(req.userId);
        if (!user || user.Usertype !== "Owner") {
            return res.status(403).json({ success: false, message: "You are not authorized to create a restaurant" });
        }

        // Create restaurant
       let created_hotel= await ReastaurantModel.create(req.body);
        return res.status(201).json({ success: true, message: "Restaurant created successfully" ,id:created_hotel._id});

    } catch (error) {
        console.error("Error in createRestaurant API:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};

// Find Hotel Controller
const findHotel = async (req, res) => {
    try {
        const { _id, Dish_Name, Category, maxPrice, minPrice, ...rest } = req.query;

        if (Object.keys(rest).length > 0)
            return res.status(400).json({ success: false, message: "Invalid query parameters provided" });

        let query = {};
        if (_id) query["_id"] = _id;
        if (Dish_Name) query["foods.Dish_Name"] = Dish_Name;
        if (Category) query["foods.Category"] = Category;

        if (maxPrice || minPrice) {
            query["foods.Price"] = {};
            if (minPrice) query["foods.Price"]["$gte"] = parseInt(minPrice);
            if (maxPrice) query["foods.Price"]["$lte"] = parseInt(maxPrice);
        }

        const hotels = await ReastaurantModel.find(query);
        if (!hotels.length) {
            return res.status(404).json({ success: false, message: "No hotels found matching the criteria" });
        }

        return res.status(200).json({ success: true, message: "Hotels fetched successfully", data: hotels });

    } catch (error) {
        console.error("Error in findHotel API:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};

// Place Order Controller
const PlaceOrder = async (req, res) => {
    try {
        const { _id } = req.query;
        const { quantity, dish_Name } = req.body;

        if (!quantity || quantity <= 0) {
            return res.status(400).json({ success: false, message: "Quantity must be greater than 0" });
        }

        const hotel = await ReastaurantModel.findById(_id);
        if (!hotel) {
            return res.status(404).json({ success: false, message: "Hotel not found" });
        }

        let itemFound = false;
        let actualPrice;

        for (let food of hotel.foods) {
            if (food.Dish_Name === dish_Name && food.Quantity >= quantity) {
                itemFound = true;
                actualPrice = food.Price;
                food.Quantity -= quantity;
                await hotel.save();
                break;
            }
        }

        if (!itemFound) {
            return res.status(404).json({ success: false, message: "Dish not found or insufficient quantity" });
        }

        const totalAmount = actualPrice * quantity;
        const upiLink = `upi://pay?pa=7887568942@ybl&pn=Shardul%20Chatufale&am=${totalAmount}&cu=INR`;

        qrcode.toDataURL(upiLink, (err, qrCodeUrl) => {
            if (err) {
                console.error("Error generating QR code:", err);
                return res.status(500).json({ success: false, message: "Error generating QR code", error: err.message });
            }

            return res.status(200).json({
                success: true,
                message: `Order placed successfully. Please pay ₹${totalAmount}.`,
                qrCodeUrl: qrCodeUrl
            });
        });

    } catch (error) {
        console.error("Error in PlaceOrder API:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};

// Exporting Controllers
module.exports = {
    createRestaurant,
    findHotel,
    PlaceOrder
};
