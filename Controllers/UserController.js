const UserModel = require("../Model/UserModel");
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

// Utility function to check if a value is valid
const isValid = function (val) {
    if (typeof val === "undefined" || val === null) return false;
    if (typeof val === "string" && val.trim().length === 0) return false;
    return true;
};

let phoneRegex = /^[6-9]\d{9}$/;
let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
let passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,15}$/;

// Get user details
const getUser = async (req, res) => {
    try {
        let findUser = await UserModel.findById(req["userId"], { Password: 0, _id: 0 });
        return res.status(200).send({ findUser, success: true });
    } catch (err) {
        return res.status(500).send({ message: "Please login and provide token in header", success: false });
    }
};

// Update user details
const updateUser = async (req, res) => {
    try {
        const { UserName, Email, Password, phone, Profile, Address, ...rest } = req.body;

        if (Object.keys(rest).length > 0) 
            return res.status(400).send({ success: false, message: "Invalid fields in request" });

        if (Object.keys(req.body).length == 0) 
            return res.status(400).send({ success: false, message: "No fields to update" });

        const findUser = await UserModel.findById(req['userId']);
        if (!findUser) return res.status(404).send({ success: false, message: "User not found" });

        if (UserName) {
            if (!isValid(UserName)) return res.status(400).send({ success: false, message: "Invalid username" });
            const usernameExists = await UserModel.findOne({ UserName });
            if (usernameExists) return res.status(400).send({ success: false, message: "Username already in use" });
            findUser.UserName = UserName;
        }

        if (Email) {
            if (!emailRegex.test(Email)) return res.status(400).send({ success: false, message: "Invalid email" });
            const emailExists = await UserModel.findOne({ Email });
            if (emailExists) return res.status(400).send({ success: false, message: "Email already in use" });
            findUser.Email = Email;
        }

        if (phone) {
            if (!phoneRegex.test(phone)) return res.status(400).send({ success: false, message: "Invalid phone number" });
            findUser.phone = phone;
        }

        if (Profile) {
            findUser.Profile = Profile;
        }

        if (Address) {
            if (!isValid(Address)) return res.status(400).send({ success: false, message: "Invalid address" });
            findUser.Address = Address;
        }

        await findUser.save();
        return res.status(200).send({ success: true, message: "User updated successfully" });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ success: false, message: "Server error" });
    }
};

// Forgot password - Generate OTP
const forgotPassword = async (req, res) => {
    const { Email } = req.body;

    if (!emailRegex.test(Email)) {
        return res.status(400).send({ success: false, message: "Invalid email" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);

    const user = await UserModel.findOneAndUpdate({ Email }, { OTP: otp }, { new: true });
    if (!user) return res.status(404).send({ success: false, message: "User not found" });

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'shardulschatufale@gmail.com',
            pass: 'izkt cnpp mrdu dhmx' // App Password
        }
    });

    const mailOptions = {
        from: 'shardulschatufale@gmail.com',
        to: Email,
        subject: 'Your OTP Code',
        text: `Your OTP code is: ${otp}`
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).send({ success: true, message: `OTP sent to ${Email}` });
    } catch (error) {
        res.status(500).send({ success: false, message: "Failed to send OTP" });
    }
};

// Verify OTP and update password
const verifyOTP = async (req, res) => {
    const { Email, OTP, NewPassword } = req.body;

    if (!emailRegex.test(Email)) return res.status(400).send({ success: false, message: "Invalid email" });
    if (!passwordRegex.test(NewPassword)) return res.status(400).send({ success: false, message: "Invalid password" });

    const user = await UserModel.findOne({ Email, OTP });
    if (!user) return res.status(400).send({ success: false, message: "Invalid OTP" });

    const salt = await bcrypt.genSaltSync(10);
    user.Password = bcrypt.hashSync(NewPassword, salt);
    user.OTP = null;
    await user.save();

    return res.status(200).send({ success: true, message: "Password updated successfully" });
};

// Delete user
const deleteUser = async (req, res) => {
    try {
        await UserModel.findByIdAndDelete(req['userId']);
        res.status(200).send({ success: true, message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).send({ success: false, message: "Server error" });
    }
};

module.exports = {
    getUser,
    updateUser,
    forgotPassword,
    verifyOTP,
    deleteUser
};
