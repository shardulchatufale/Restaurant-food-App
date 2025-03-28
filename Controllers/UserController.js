const UserModel = require("../Model/UserModel")
const bcrypt = require('bcryptjs')
const nodemailer=require('nodemailer')

const isValid = function (val) {
    if (typeof val === "undefined" || val === null) return false;
    if (typeof val === "string" && val.trim().length === 0) return false;

    return true;
};

let phoneRegex = /^[6-9]\d{9}$/;
let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
let passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,15}$/;
let nameRegex = /^([a-zA-Z])+$/;

const getUser = async (req, res) => {
    try {

        let findUser = await UserModel.findById(req["userId"], { Password: 0, _id: 0 })

        return res.status(200).send({ findUser, success: true })
    } catch (err) {
        return res.status(500).send({ message: "You are not logd in please provide token in header", success: false })
    }
}

const UpdateUser = async (req, res) => {

    try {
        const body = req.body


        let { UserName, Email, Password, phone, Usertype, Profile, Address, ...rest } = body

        if (Object.keys(rest).length > 0) return res.status(500).send({ success: false, message: "you cant update more than username,email,password,phone usertype,profile,address" })
        if (Object.keys(body).length == 0) return res.status(500).send({ success: false, message: "provide field to update " })

        const findUser = await UserModel.findById(req['userId'])

        if (UserName) {
            if (!isValid(UserName)) return res.status(500).send({ success: false, message: "Username is invalid" })
            const FindUsername = await UserModel.findOne({ UserName: UserName })
            if (FindUsername) return res.status(500).send({ success: false, message: "username is already in use" })
            findUser.UserName = UserName
        }

        if (Email) {
            if (!isValid(Email)) return res.status(500).send({ success: false, message: "Email is invalid" })
            if (!emailRegex.test(Email)) return res.status(500).send({ success: false, message: "Email is invalid" })
            const FindEmail = await UserModel.findOne({ Email: Email })
            if (FindEmail) return res.status(500).send({ success: false, message: "Email is already in use" })
            findUser.Email = Email
        }
     
        if (phone) {

            if (!phoneRegex.test(phone)) return res.status(500).send({ success: false, message: "Phone number format is wrong" })
            findUser.phone = phone

        }
        /*
                  if(Usertype){
                    if((Usertype !=="Client")||(Usertype!=="Admin"))return res.status(500).send({success:false,message:"you canot provide usertype elese than Client Admin Vendor Driver "})
                    findUser.Usertype=Usertype
                  }
        */
        if (Profile) {

            findUser.Profile = Profile
        }

        if (Address) {
            if (!isValid(Address)) return res.status(500).send({ success: false, message: "invalisd address" })
            findUser.Address = Address
        }
//findUser.save()
       
         const updatedUser = await UserModel.findByIdAndUpdate({ _id: req['userId'], findUser })
        return res.status(201).send({ success: true }, { new: true })

    } catch (err) {
        console.log(err);
    }
}


const ForgotPass = async function (req, res) {
    console.log(".......94");
    const { Email,...rest } = req.body;
    if (Object.keys(rest).length > 0) return res.status(500).send({ success: false, message: "you cant provide other than email" })
        if (Object.keys(req.body).length == 0) return res.status(500).send({ success: false, message: "provide email to update " })

    if (!Email || !emailRegex.test(Email)) {
        return res.status(500).send({ success: false, message: "Email is invalid" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);

    const user = await UserModel.findOneAndUpdate(
        { Email: Email }, 
        { OTP: otp },
        { new: true }  
    );

    if (!user) {
        return res.status(404).json({ error: "User not found or unable to update OTP." });
    }

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
        res.status(200).json({ message: `OTP sent successfully to ${Email}. After this, please hit the verify and update password API.` });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: 'Failed to send OTP' });
    }
};


const varifyOTP=async (req,res)=>{
    let {Email,OTP,NewPassword}=req.body

    if(!Email)return res.status(500).send({ success: false, message: "Email is required" })
    if (!isValid(Email)) return res.status(500).send({ success: false, message: "Email is invalid" })
    if (!emailRegex.test(Email)) return res.status(500).send({ success: false, message: "Email is invalid" })

    if(OTP.length>6)return res.status(500).send({ success: false, message: "OTP is wrong please check mail" })

    if (!passwordRegex.test(NewPassword)) return res.status(400).send({ status: false, message: "password is not valid, enter a valid paasword" })

    let check=await UserModel.findOne({Email:Email,OTP:OTP})
    if(!check)return res.status(500).send({ success: false, message: "Invalid OTP" })

    const salt= await bcrypt.genSaltSync(10)
    NewPassword = bcrypt.hashSync(NewPassword,salt)

    let updatePass=await UserModel.findOneAndUpdate({Email:Email},{Password:NewPassword})
    return res.status(201).send({ success: true, message: "password is updated succcessfully" })

}

const deleteUser= async (req,res)=>{
    await UserModel.findByIdAndDelete(req['userId'])
    res.status(201).json({ message: 'User deleted successfully' });
}








module.exports = {
    ForgotPass,
    getUser,
    UpdateUser,varifyOTP,deleteUser
};