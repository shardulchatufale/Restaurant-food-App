const express=require ("express");
const {  Register, Login } = require("../Controllers/AuthController");
const { TestControllerUser } = require("../Controllers/TestController");

const {getUser,UpdateUser, ForgotPass, varifyOTP, deleteUser} = require("../Controllers/UserController");


const { authantication, Authorization } = require("../Middleware/Authantication");
const {createRestaurant , findHotel, PlaceOrder}= require("../Controllers/RestaurantController");


const Router=express.Router();

Router.post("/Register",Register)
Router.get("/Login",Login)

Router.post("/ForgotPass",ForgotPass)
Router.post("/varifyOTP",varifyOTP)

Router.get("/GetUser",authantication,getUser)
Router.get("/UpdateUser" ,authantication,Authorization,UpdateUser)
Router.delete("/DeleteUser" ,authantication,Authorization,deleteUser)

Router.get("/Createrestaurant",authantication,Authorization,createRestaurant)
Router.get("/GetRestaurant", authantication,findHotel)

Router.post("/Placeorder",authantication,PlaceOrder)

Router.get("/Test-user",TestControllerUser)



module.exports=Router