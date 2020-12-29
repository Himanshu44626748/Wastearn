const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const hbs = require("hbs");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const app = express();
const multer = require("multer");

mongoose.connect("mongodb+srv://himanshu446267:44626748@cluster0.76uy4.mongodb.net/himanshu?retryWrites=true&w=majority", {useNewUrlParser: true, useUnifiedTopology: true})
.then(() => {
    console.log("Connected to database");
}).catch((error) => {
    console.log(error);
});

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "himanshu201952215@gmail.com",
        pass: "201952215"
    }
})

const schema = new mongoose.Schema({
    name: String,
    address: String,
    description: String,
    email: String,
    phone: Number,
    img: String
});

var storage = multer.diskStorage({
    destination: "./public/uploads/",
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '_' + Date.now()+path.extname(file.originalname));
    }
});

const upload = multer({storage: storage}).single("image");

const seller = new mongoose.model("Seller", schema);

app.use(bodyParser.urlencoded({extended: false}));

const public = path.join(__dirname, "../public");
app.use(express.static(public));

const views = path.join(__dirname, "../views");
app.set("views", views);
app.set("view engine", "hbs");

const partial = path.join(__dirname, "../partials");
hbs.registerPartials(partial);

app.get("/", (req, res) => {
    res.render("recyclepage");
});

app.get("/sell", (req, res) => {
    res.render("form");
});

app.get("/company", (req, res) => {
    res.render("company");
});

app.post("/sell", upload, async (req, res) => {
    
    const newSeller = new seller({
        name: req.body.name,
        address: req.body.address,
        description: req.body.description,
        email: req.body.email,
        phone: req.body.phone,
        img: req.file.filename
    })

    const result = false; //await newSeller.save();

    if(result){

        const mailOption = {
            from: req.body.email,
            to: "himanshu446267@gmail.com",
            subject: "Waste Found",
            text: `${req.body.name} is selling their waste please collect it from ${req.body.address}. His contact number is - ${req.body.phone} and Email id is - ${req.body.email}`
        }

        console.log("Data successfully inserted");

        res.render("form", {
            successMsg: "Thank you for recycling your waste"
        });
        
        transporter.sendMail(mailOption, (error, info) => {
            if(error){
                console.log(error);
            }else{
                console.log("Mail send");
            }
        })
    }
    else{
        console.log("Fail to insert data");

        res.render("form", {
            failMsg: "Service is currently not available in your area"
        });
    }
});

app.listen(8000, () => {
    console.log("Server is running on port number 8000");
});