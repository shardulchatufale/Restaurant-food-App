const UserModel = require("../Model/UserModel");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Utility function to validate input
const isValid = (val) => {
    return !(typeof val === "undefined" || val === null || (typeof val === "string" && val.trim().length === 0));
};

let phoneRegex = /^[6-9]\d{9}$/;
let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
let passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,15}$/;
let nameRegex = /^([a-zA-Z])+$/;

// Register Controller
const Register = async (req, res) => {
    try {
        const { UserName, Email, Password, Address, phone, Usertype } = req.body;

        // Validating required fields
        if (!isValid(UserName) || !nameRegex.test(UserName)) {
            return res.status(400).send({ success: false, message: "Invalid or missing username" });
        }
        if (!isValid(Email) || !emailRegex.test(Email)) {
            return res.status(400).send({ success: false, message: "Invalid or missing email" });
        }
        if (!isValid(Password) || !passwordRegex.test(Password)) {
            return res.status(400).send({ success: false, message: "Invalid or missing password" });
        }
        if (!isValid(Address)) {
            return res.status(400).send({ success: false, message: "Invalid or missing address" });
        }
        if (!phoneRegex.test(phone)) {
            return res.status(400).send({ success: false, message: "Invalid phone number" });
        }

        // Check if email or username already exists
        const existingUser = await UserModel.findOne({ $or: [{ Email }, { UserName }] });
        if (existingUser) {
            const field = existingUser.Email === Email ? "Email" : "Username";
            return res.status(409).send({ success: false, message: `${field} is already registered` });
        }

        // Hashing password
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = await bcrypt.hashSync(Password, salt);

        // Creating user
        const newUser = await UserModel.create({ 
            UserName, 
            Email, 
            Password: hashedPassword, 
            Address, 
            phone, 
            Usertype 
        });

        return res.status(201).send({ 
            success: true, 
            message: "User registered successfully", 
            user: newUser 
        });

    } catch (error) {
        console.error("Error in Register API:", error);
        res.status(500).send({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};

// Login Controller
const Login = async (req, res) => {
    try {
        const { Email, Password } = req.body;

        // Validate input
        if (!isValid(Email) || !emailRegex.test(Email)) {
            return res.status(400).send({ success: false, message: "Invalid or missing email" });
        }
        if (!isValid(Password) || !passwordRegex.test(Password)) {
            return res.status(400).send({ success: false, message: "Invalid or missing password" });
        }

        // Find user by email
        const user = await UserModel.findOne({ Email });
        if (!user) {
            return res.status(404).send({ success: false, message: "User not found" });
        }

        // Verify password
        const isMatch = await bcrypt.compare(Password, user.Password);
        if (!isMatch) {
            return res.status(401).send({ success: false, message: "Incorrect password" });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id.toString() },
            "Food_App",
            { expiresIn: '1h' }
        );

        return res.status(200).send({ 
            success: true, 
            message: "Login successful", 
            token ,
            Id:user._id
        });

    } catch (error) {
        console.error("Error in Login API:", error);
        return res.status(500).send({ 
            success: false, 
            message: "Internal Server Error", 
            error: error.message 
        });
    }
};

module.exports = { Register, Login };
