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

const sellerSchema = new mongoose.Schema({
    name: String,
    city: String,
    description: String,
    email: String,
    phone: Number,
    img: String
});

const buyerSchema = new mongoose.Schema({
    orgName: String,
    city: String,
    description: String,
    email: String,
    phone: Number
});

var storage = multer.diskStorage({
    destination: "./public/uploads/",
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '_' + Date.now()+path.extname(file.originalname));
    }
});

const upload = multer({storage: storage}).single("image");

const seller = new mongoose.model("Seller", sellerSchema);
const buyer = new mongoose.model("Buyer", buyerSchema);

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

app.get("/buy", (req, res) => {
    res.render("buy");
})

app.post("/company", async (req, res) => {

    const newBuyer = new buyer({
        orgName: req.body.orgName,
        city: req.body.city,
        description: req.body.description,
        email: req.body.email,
        phone: req.body.phone
    });

    const result = await newBuyer.save();
    console.log(req.body.email);

    if(result){

        console.log("Data successfully inserted");

        res.render("form", {
            successMsg: "Registered Successfully"
        });
    }
    else{
        console.log("Fail to insert data");

        res.render("form", {
            failMsg: "Failed to registered. Please try again"
        });
    }

})

var match = false;

app.post("/sell", upload, async (req, res) => {
    
    try{
        const newSeller = new seller({
            name: req.body.name,
            city: req.body.city,
            description: req.body.description,
            email: req.body.email,
            phone: req.body.phone,
            img: req.file.filename
        })
    
        const result = await newSeller.save();
    
        const orgCity = await buyer.find({city: req.body.city}).select({email:1, city:1, _id: 0});
        console.log(orgCity);
    
        if(orgCity[0].city)
        {
        
            const mailOption = {
                from: req.body.email,
                to: orgCity[0].email,
                subject: "Waste Found",
                text: `${req.body.name} is selling their waste please collect it from ${req.body.city}. His contact number is - ${req.body.phone} and Email id is - ${req.body.email}`
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
    }catch(error){
        res.render("form", {
            failMsg: "Service is currently not available in your area"
        });
    }
});

app.listen(8000, () => {
    console.log("Server is running on port number 8000");
});