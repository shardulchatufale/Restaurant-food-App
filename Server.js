const express=require ("express");
const cors=require("cors");
const morgan=require ("morgan");
const  route  = require("./Routs/TeastRouts");


const app= express();
app.use(cors());
app.use(morgan("dev"));

app.use('/', route);

app.get("/",(req,res)=>{return res.status(200).send("welcome to food app")});
const Port=8080;
app.listen(Port,()=>{console.log(       `your app is running on port ${Port}`)})

