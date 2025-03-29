const express=require ("express");
const {  Register, Login } = require("../Controllers/AuthController");
const { TestControllerUser } = require("../Controllers/TestController");


const { getUser,
    updateUser,
    forgotPassword,
    verifyOTP ,
    deleteUser} = require("../Controllers/UserController");


const { authentication, authorization  } = require("../Middleware/Authantication");
const {createRestaurant , findHotel, PlaceOrder}= require("../Controllers/RestaurantController");


const Router=express.Router();

Router.post("/Register",Register)
Router.get("/Login",Login)

Router.post("/ForgotPass",forgotPassword)
Router.post("/varifyOTP",verifyOTP)

Router.get("/GetUser",authentication,getUser)
Router.post("/UpdateUser" ,authentication,authorization,updateUser)
Router.delete("/DeleteUser" ,authentication,authorization,deleteUser)

Router.get("/Createrestaurant",authentication,authorization,createRestaurant)
Router.get("/GetRestaurant", authentication,findHotel)

Router.post("/Placeorder",authentication,PlaceOrder)

Router.get("/Test-user",TestControllerUser)



module.exports=Router