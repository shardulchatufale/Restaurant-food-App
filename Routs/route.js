const express=require ("express");
const {  Register, Login } = require("../Controllers/AuthController");
const { TestControllerUser } = require("../Controllers/TestController");

const {getUser,UpdateUser, ForgotPass, varifyOTP} = require("../Controllers/UserController");


const { authantication, Authorization } = require("../Middleware/Authantication");


const Router=express.Router();

Router.post("/Register",Register)
Router.get("/Login",Login)

Router.post("/ForgotPass",ForgotPass)
Router.post("/varifyOTP",varifyOTP)

Router.get("/GetUser",authantication,getUser)
Router.get("/UpdateUser" ,authantication,Authorization,UpdateUser)

Router.get("/Test-user",TestControllerUser)



module.exports=Router