const UserModel = require("../Model/UserModel");
const bcrypt=require('bcryptjs')
const  jwt=require('jsonwebtoken');
const { use } = require("../Routs/route");


const isValid = function (val) {
    if (typeof val === "undefined" || val === null) return false;
    if (typeof val === "string" && val.trim().length === 0) return false;

    return true;
};

let phoneRegex = /^[6-9]\d{9}$/;
let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
let passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,15}$/;
let nameRegex = /^([a-zA-Z])+$/;


// Register Controller
const Register = async (req, res) => {



    try {

        const { UserName, Email, Password, Address, phone, Usertype } = req.body;
        if (!isValid(UserName)) {
            return res.status(400).send({ status: false, message: "Username name is Required" })
        }

        if (!isValid(Email)) {
            return res.status(400).send({ status: false, message: "Email name is Required" })
        }

        if (!isValid(Password)) {
            return res.status(400).send({ status: false, message: "password name is Required" })
        }

        if (!isValid(Address)) {
            return res.status(400).send({ status: false, message: "Address name is Required" })
        }

        if (!phoneRegex.test(phone)) { return res.status(400).send({ status: false, message: "Phone is not valid, enter a valid phone number" }) }
        if (!emailRegex.test(Email)) return res.status(400).send({ status: false, message: "email is not valid, enter a valid email " })
        if (!passwordRegex.test(Password)) return res.status(400).send({ status: false, message: "password is not valid, enter a valid paasword" })
        if (!nameRegex.test(UserName)) return res.status(400).send({ status: false, message: "username is not valid, enter a valid username" })
        // Check if email already exists
        const salt=bcrypt.genSaltSync(10)
        const hashedpass=await bcrypt.hashSync(Password,salt)

        let existingUser = await UserModel.findOne({ Email });
        if (existingUser) {
            return res.status(409).send({ success: false, message: "Email is already registered" });
        }

        // Check if username already exists
        let existingUsername = await UserModel.findOne({ UserName });
        if (existingUsername) {
            return res.status(409).send({ success: false, message: "Username is already taken" });
        }

        // Create new user
        let createUser = await UserModel.create({ UserName, Email, Password:hashedpass, Address, phone, Usertype });

        return res.status(201).send({ success: true, message: "User created successfully", user: createUser });
    } catch (error) {
        console.error("Error in Register API:", error);
        res.status(500).send({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};

const Login = async (req, res) => {
    try {
        const { Email, Password } = req.body

        if (!emailRegex.test(Email)) return res.status(400).send({ status: false, message: "Email format is wrong" })
        if (!passwordRegex.test(Password)) return res.status(400).send({ status: false, message: "password  format is wrong" })

console.log(".......83");
        let user = await UserModel.findOne({ Email: Email })
console.log("....",user);
        if (!user) {
            return res.status(404).send({ success: false, message: "Email not found" })
        }

        const isMatch=await bcrypt.compare(Password,user.Password)
        
        if(!isMatch){
            return res.status(500).send({
                success:false,
                message:"password is incorrect"
            })
        }
        let token = jwt.sign({
        userId:user._id.toString()
        }, 
        "Food_App",
        { expiresIn: '1h' }
        )

        console.log(token,".........105");

return res.status(200).send({ success: true, user,token })
    } catch (error) {
        return res.status(500).send({ success: false, message: "internal server eroor" })
    }
}

module.exports = { Register, Login }