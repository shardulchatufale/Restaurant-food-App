const ReastaurantModel = require("../Model/ReastaurantModel")
const UserModel = require("../Model/UserModel")
const mongoose = require('mongoose');


const isValid = function (val) {
    if (typeof val === "undefined" || val === null) return false;
    if (typeof val === "string" && val.trim().length === 0) return false;

    return true;
};
const createRestaurant = async (req, res) => {

    let { title, imeageURL, foods, TimeRanges, pickup, delivery, isOpen, logoURL, rating, code
        , coords, time, ...rest } = req.body



    if (Object.keys(rest).length > 0) return res.status(500).send({ success: false, messsage: `you canot prode  thing other than schema ${Object.keys(rest)}` })
    if (Object.keys(req.body).length == 0) return res.status(500).send({ success: false, messsage: "All fields is required" })

    if (!title || !imeageURL || !foods || !TimeRanges || !logoURL || !rating || !code || !coords)
        return res.status(500).send({ success: false, messsage: "All fields is required" })

    if (!isValid(title))
        return res.status(500).send({ success: false, messsage: "Title is invalid" })

    if (imeageURL) {
        if (typeof imeageURL !== 'string') { }
    }


    for (i = 0; i < foods.length; i++) {

        if (!foods[i].Dish_Name || typeof foods[i].Dish_Name !== 'string') {
            console.log(foods[i]);
            return res.status(400).send({
                success: false,
                message: "Each food item must include a valid 'Dish_Name'."
            });
        }

        if (!foods[i].Price || typeof (foods[i].Price) !== "number") {
            console.log(typeof foods[i].Price);
            return res.status(400).send({
                success: false,
                message: "Each food item must include a valid 'price'."
            });
        }
        const validCategories = ["Snaks", "Meal", "Breakfast"];


        if (!foods[i].Category || typeof (foods[i].Category) !== 'string' || !validCategories.includes(foods[i].Category)) {
            console.log(foods[i]);
            return res.status(400).send({

                success: false,
                message: "Each food item must include a valid category.it should be string and from Snaks or Meal or Breakfast "
            });
        }

    }


    let check = await UserModel.findById({ _id: req['userId'] })

    if (check.Usertype !== "Owner") {
        return res.status(400).send({
            success: false,
            message: "You cannot create hotel,your profile type is customer"
        })
    }

    await ReastaurantModel.create(req.body)

    return res.status(201).send({
        success: true,
        message: "Hotel created successfully"
    })

}
const findHotel = async (req, res) => {
    try {

        const { _id, Dish_Name, Category, maxPrice, minPrice, ...rest } = req.query;
        if (Object.keys(rest).length > 0) {
            res.status(400).json({
                success: false,
                message: "You cant provide other tan '_id, Dish_Name, Category, maxPrice, minPrice'"
            });
        }


        let query = {};

        if (_id) {
            query["_id"] = _id;
        }

        if (Dish_Name) {
            query["foods.Dish_Name"] = Dish_Name;
        }

        if (Category) {
            query["foods.Category"] = Category;
        }

        if (maxPrice || minPrice) {
            query["foods.Price"] = {};
            if (minPrice) query["foods.Price"]["$gte"] = parseInt(minPrice);
            if (maxPrice) query["foods.Price"]["$lte"] = parseInt(maxPrice);
        }

        const hotels = await ReastaurantModel.find(query);
        if (hotels.length == 0) {
            res.status(200).json({
                success: false,
                message: "No hotel according to filter"

            })
        } else {
            res.status(200).json({
                success: true,
                message: "Hotels fetched successfully",
                data: hotels,
            });
        }



    } catch (err) {
        res.status(500).json({
            success: false,
            message: "An error occurred while fetching hotels",
            error: err.message,
        });
    }
};

const PlaceOrder = async (req, res) => {
    console.log(".........139");

    const { _id } = req.query
    const { quantity } = req.body
    const { dish_Name } = req.body

    const hotels = await ReastaurantModel.findOne({ _id: _id });

    console.log(hotels.foods, ".....150");

    if (hotels === null) {
        res.status(400).send({
            success: false,
            message: "this hotel dont have dish or quantity of dish in boder",
            hotelInfo: hotels,
        });
    }
    console.log(hotels);

    let checkItems = false
    let actPrice
    for (let i = 0; i < hotels.foods.length; i++) {

        if (hotels.foods[i].Quantity > quantity && hotels.foods[i].Dish_Name === dish_Name) {
            checkItems = true
            hotels.foods[i].Quantity = hotels.foods[i].Quantity - quantity
            actPrice = hotels.foods[i].Price
            await hotels.save()
            break
        }

    }

    if (checkItems == true) {
        res.status(200).json({
            success: true,
            message: `Order placed successfully,you have to pay ${actPrice * quantity}  `,
            

        })
    } else {
        res.status(400).json({
            success: false,
            message: "items is invalid"

        })
    }

}




module.exports = {
    createRestaurant, findHotel, PlaceOrder
};

/*

 const check_items=await ReastaurantModel.find({$and:[
    { "foods.Quantity":{$gte:quantity}},
    { "foods.Dish_Name":dish_Name}
 ]})

 if(check_items.length==0){
     res.status(400).json({
         success: false,
         message: "No Items found provided by you"
     
     })}
 
 */