const express = require("express");
const mongoose = require("mongoose")
const cors = require("cors");
const morgan = require("morgan");
const route = require('./Routs/route')

const app = express();
app.use(cors());
app.use(morgan("dev"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose
    .connect(
        'mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+1.9.1'

    )
    .then(() => console.log('MongoDb is connected'))
    .catch((err) => console.log(err));

app.use('/', route);


app.get("/", (req, res) => {
    return res.status(200).send("welcome to food app")
});
const Port = 8080;
app.listen(Port, () => {
    console.log(`your app is running on port ${Port}`)
})

