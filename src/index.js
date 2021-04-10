const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const hbs = require("hbs");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const app = express();
const multer = require("multer");
const user = require('../models/user');
const connectDB = require('../config/db');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require('dotenv').config();
var cookieParser = require('cookie-parser')
const port = process.env.PORT || 8000;

mongoose.connect("mongodb+srv://himanshu446267:44626748@cluster0.76uy4.mongodb.net/himanshu?retryWrites=true&w=majority", {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true})
.then(() => {
    console.log("Connected to database");
}).catch((error) => {
    console.log(error);
});

connectDB();

//Init middlewares
app.use(express.json({
    extented : false
}))

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "himanshu201952215@gmail.com",
        pass: "Him@n$hu201952215"
    }
})

var storage = multer.diskStorage({
    destination: "./public/uploads/",
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '_' + Date.now()+path.extname(file.originalname));
    }
});

const upload = multer({storage: storage}).single("image");

app.use(bodyParser.urlencoded({extended: false}));

const public = path.join(__dirname, "../public");
app.use(express.static(public));
app.use(cookieParser())

const views = path.join(__dirname, "../views");
app.set("views", views);
app.set("view engine", "hbs");

const partial = path.join(__dirname, "../partials");
hbs.registerPartials(partial);

app.get("/", async (req, res) => {
    try{
        const token = req.cookies.jwt;
        const verify = jwt.verify(token, "wastearndevelopedbyteamblackpearl");
        var data = await user.findOne({_id: verify._id});
        var orgData = await org.findOne({_id: verify._id});
        if(data) {
            res.render("recyclepage", {
                n: data.name,
                loggedin: true, 
            });
        } else if(orgData){
            res.render("recyclepage", {
                n:orgData.name,
                orgLoggedin: true
            })
        }
    }
    catch(e){
        res.render("recyclepage");
    }
});

app.get("/sell", async (req, res) => {
    try{
        const token = req.cookies.jwt;
        const verify = jwt.verify(token, "wastearndevelopedbyteamblackpearl");
        var data = await user.findOne({_id: verify._id});
        res.render("form", {
            n: data.name,
            loggedin: true
        });
    }
    catch(e){
        res.render("form", {
            loggedin: false
        });
    }
});


app.get("/company", (req, res) => {
    try{
        const token = req.cookies.jwt;
        const verify = jwt.verify(token, "wastearndevelopedbyteamblackpearl");
        res.render("company", {
            loggedin: true
        });
    }
    catch(e){
        res.render("company", {
            loggedin: false
        });
    }
});

app.get("/buy", (req, res) => {
    try{
        const token = req.cookies.jwt;
        const verify = jwt.verify(token, "wastearndevelopedbyteamblackpearl");
        res.render("buy", {
            loggedin: true
        });
    }
    catch(e){
        res.render("buy", {
            loggedin: false
        });
    }
})

app.get("/org", async (req, res) => {
    try{
        const token = req.cookies.jwt;
        const verify = jwt.verify(token, "wastearndevelopedbyteamblackpearl");
        var data = await user.findOne({_id: verify._id});
        res.render("organisation", {
            n: data.name,
            st: "none",
            loggedin: true
        });
    }
    catch(e){
        res.render("organisation", {
            st: "none",
            loggedin: false
        });
    }
    
})

var match = false;

// const Data = null;
app.post("/sell", upload, async (req, res) => {
    
    try{


        const token = req.cookies.jwt;
        const verify = jwt.verify(token, "wastearndevelopedbyteamblackpearl");
        var d = await user.findOne({_id: verify._id});


        var type = req.body.type.toLowerCase()
        var address = req.body.address.toLowerCase()
        var city = req.body.city.toLowerCase()
        var state = req.body.state.toLowerCase()
        var status = `Waiting for buyer`.toLowerCase()
        var img = req.file.filename

        // Data = userName;

        //console.log(d);

        await d.createNewSell(type, address, city, state, status, img);

        //console.log(orgCity);
    
        res.render("form", {
            n: d.name,
            successMsg: "Thank you for recycling your waste",
            loggedin: true
        });

    }catch(error){

        console.log(error);
        res.render("form", {
            failMsg: "Service is currently not available in your city",
            loggedin: true
        });
    }
});

app.post("/org", async (req, res) => {

    try{
        var city = req.body.city.toLowerCase();
        let t = await org.find({city});

        const token = req.cookies.jwt;
        const verify = jwt.verify(token, "wastearndevelopedbyteamblackpearl");
        var data = await user.findOne({_id: verify._id});
        //console.log(t);
        
        let msg = "";

        if(t.length == 0)
        {
            msg = "No organisation found";
        }

        //console.log(msg);

        res.render("organisation", {
            n: data.name,
            org: t,
            msg: msg,
            loggedin: true
        });
    }
    catch(error){
        res.render("organisation", {
            loggedin: true
        });
        //console.log(error);
    }
});

app.get("/checkStatus" , async (req, res) => {
    try{
        const token = req.cookies.jwt;
        const verify = jwt.verify(token, "wastearndevelopedbyteamblackpearl");
        var data = await user.findOne({_id: verify._id});

        var wastes = data.wastes;

        if(wastes.length >= 1)
        {
            res.render("checkStatus", {
                n: data.name,
                waste: wastes,
                loggedin: true
            })
        }
        else{
            res.render("checkStatus", {
                n: data.name,
                waste: wastes,
                loggedin: true
            })
        }
    }
    catch(e){
        res.render("checkStatus", {
            loggedin: false
        });
    }
});

app.get("/updateStatus", async(req, res) => {
    const token = req.cookies.jwt;
    const verify = jwt.verify(token, "wastearndevelopedbyteamblackpearl");
    var data = await org.findOne({_id: verify._id});

    res.render("updateStatus", {
        n: data.name,
        orgLoggedin: true
    });
});

app.post("/updateStatus", async (req, res) => {

    try{
        var id = req.body.id;
        var status = req.body.status.toLowerCase();

        var data = await user.findOne({wastes:{$elemMatch:{_id: id}}});

        const token = req.cookies.jwt;
        const verify = jwt.verify(token, "wastearndevelopedbyteamblackpearl");
        var d = await org.findOne({_id: verify._id});

        if(data.wastes.length > 0)
        {
            for(i=0;i<data.wastes.length;i++)
            {
                if(req.body.id == data.wastes[i]._id)
                {
                    data.wastes[i].status = status
                }
            }

            await data.save();

            res.render("updateStatus", {
                msg: "Updated",
                n: d.name,
                orgLoggedin: true
            });
            
        }
        else{
            res.render("updateStatus", {
                error: "Wrong waste id",
                n: d.name,
                orgLoggedin: true
            });
        }
    
    }
    catch(e)
    {
        console.log(e)
    }

});

app.get("/orgHome", async(req, res) => {

    var status = 'waiting for buyer';

    const token = req.cookies.jwt;
    const verify = jwt.verify(token, "wastearndevelopedbyteamblackpearl");
    var d = await org.findOne({_id: verify._id});

    var data = await user.find();

    var arr = [];

    for(i=0;i<data.length;i++)
    {
        var w = data[i].wastes.length;
        for(j=0;j<w;j++)
        {
            if(data[i].wastes[j].status === status)
            {
                arr.push({
                    id: `${data[i].wastes[j]._id}`,
                    name: data[i].name,
                    email: data[i].email,
                    phone: data[i].phone,
                    city: data[i].wastes[j].city,
                    type: data[i].wastes[j].type,
                    img: data[i].wastes[j].img
                })
            }
        }
    }

    res.render("organisationHome", {
        data: arr,
        n: d.name
    });
});

app.post("/orgHome", async(req, res) => {

    try{

        const token = req.cookies.jwt;
        const verify = jwt.verify(token, "wastearndevelopedbyteamblackpearl");
        var d = await org.findOne({_id: verify._id});

        var filter = req.body.filter.toLowerCase();

        var status = 'waiting for buyer';

        if(filter === "bio" || filter === "metal" || filter === "plastic" || filter === "paper")
        {
            var data = await user.find();

            var arr = []

            for(i=0;i<data.length;i++)
            {
                var w = data[i].wastes.length;

                for(j=0;j<w;j++)
                {
                    if(data[i].wastes[j].type === filter)
                    {
                        arr.push({
                            id: data[i].wastes[j]._id,
                            name: data[i].name,
                            email: data[i].email,
                            phone: data[i].phone,
                            city: data[i].wastes[j].city,
                            type: data[i].wastes[j].type,
                            img: data[i].wastes[j].img
                        })
                    }
                }
            }

            //console.log(data);

            if(data.length == 0)
            {
                res.render("organisationHome", {
                    msg: "No Waste Found",
                    n: d.name
                });
            }

            else{
                res.render("organisationHome", {
                    data: arr,
                    n: d.name
                });
            }
        }
        else{
            
            var data = await user.find();

            var arr = []

            for(i=0;i<data.length;i++)
            {
                var w = data[i].wastes.length;

                for(j=0;j<w;j++)
                {
                    if(data[i].wastes[j].city === filter)
                    {
                        arr.push({
                            id: data[i].wastes[j]._id,
                            name: data[i].name,
                            email: data[i].email,
                            phone: data[i].phone,
                            city: data[i].wastes[j].city,
                            type: data[i].wastes[j].type,
                            img: data[i].wastes[j].img
                        })
                    }
                }
            }
            
            if(data.length == 0)
            {
                res.render("organisationHome", {
                    msg: "No Waste Found",
                    n: d.name
                });
            }

            else{
                res.render("organisationHome", {
                    data: arr,
                    n: d.name
                });
            }
        }

    }
    catch(error)
    {
        console.log(error);
    }

});

app.post("/changeStatus", async(req, res) => {

    try{
        
        var data = await user.findOne({wastes:{$elemMatch:{_id: req.body.wasteId}}});

        const token = req.cookies.jwt;
        const verify = jwt.verify(token, "wastearndevelopedbyteamblackpearl");
        const orgData = await org.findOne({_id: verify._id});
      
        for(i=0;i<data.wastes.length;i++)
        {
            if(req.body.wasteId == data.wastes[i]._id)
            {
                data.wastes[i].status = `Processing under ${orgData.name}`
            }
        }

        await data.save();

        var status = 'waiting for buyer';
        const d = await user.find();

        var arr = [];

        for(i=0;i<d.length;i++)
        {
            var w = d[i].wastes.length;
            for(j=0;j<w;j++)
            {
                if(d[i].wastes[j].status === status)
                {
                    arr.push({
                        id: d[i].wastes[j]._id,
                        name: d[i].name,
                        email: d[i].email,
                        phone: d[i].phone,
                        city: d[i].wastes[j].city,
                        type: d[i].wastes[j].type,
                        img: d[i].wastes[j].img
                    })
                }
            }
        }
        res.render("organisationHome", {
            data: arr,
            n: orgData.name
        });
    }
    catch(error)
    {
        console.log(error);
    }

});

app.get("/userSignup", (req, res) => {
    res.render("signup");
});

app.post("/userSignup", async(req, res) => {

    try {

        pass = await bcrypt.hash(req.body.password, 10);

        const newUser = new user({
            name: req.body.name.toLowerCase(),
            password: pass,
            email: req.body.email,
            phone: req.body.phone,
            address: req.body.address.toLowerCase(),
            city: req.body.city.toLowerCase(),
            pincode: req.body.pincode
        });

        const token = await newUser.generateAuthToken();
        //console.log(token);

        res.cookie("jwt", token);

        const userData = await newUser.save();

        res.render("profile", {
            n: req.body.name,
            e: req.body.email,
            loggedin: true
        });
        
    } catch (error) {
        console.log(error)
    }

});

app.get("/orgSignup", (req, res) => {
    res.render("orgSignup");
})

app.post("/orgSignup", async(req, res) => {
    try {
        pass = await bcrypt.hash(req.body.password, 10);

        const newOrg = new org({
            name: req.body.name.toLowerCase(),
            orgName: req.body.orgName.toLowerCase(),
            password: pass,
            email: req.body.email,
            phone: req.body.phone,
            address: req.body.address.toLowerCase(),
            city: req.body.city.toLowerCase(),
            pincode: req.body.pincode            
        });

        const token = await newOrg.generateAuthToken();
        res.cookie("jwt", token);

        const orgData = await newOrg.save();

        var status = 'waiting for buyer';

        //var data = await seller.find({status: status});

        //console.log(data);

        res.render("recyclepage", {
            n: req.body.name,
            orgLoggedin: true
        });

    } catch (error) {
        console.log(error);
    }
})


app.get("/userLogin", async (req, res) => {
    try{
        const token = req.cookies.jwt;
        const verify = jwt.verify(token, "wastearndevelopedbyteamblackpearl");
        var data = await user.findOne({_id: verify._id});
        res.render("login", {
            n: data.name,
            loggedin: true
        });
    }
    catch(e){
        res.render("login", {
            loggedin: false
        });
    }
});

app.post("/userLogin", async (req, res) => {


    try{
        var email = req.body.email;
        var password = req.body.password;

        var data = await user.findOne({email});

        //console.log(data);

        if(data)
        {
            const token = await data.generateAuthToken();
            //console.log(token);

            res.cookie("jwt", token, {
                httpOnly: true
            });

            var hash = await bcrypt.compare(password, data.password, (err, resp) => {
                
                var name = data.name;
                var email = data.email;

                if(resp == true)
                {
                    console.log("Password match");
                    res.render("profile", {
                        n: name,
                        e: email,
                        loggedin: true
                    });
                }
                else{
                    console.log("Password not match");
                    res.render("login", {
                        msg: "Incorrect Password"
                    });
                }
            });
        }
        else{
            res.render("login", {
                msg: "Invalid email"
            })
        }
        //console.log(hash);
    }
    catch(error)
    {
        console.log(error);
    }

});

app.get("/orgLogin", async (req, res) => {
    try{
        const token = req.cookies.jwt;
        const verify = jwt.verify(token, "wastearndevelopedbyteamblackpearl");
        var data = await org.findOne({_id: verify._id});
        res.render("orgLogin", {
            n: data.name,
            orgLoggedin: true
        });
    }
    catch(e){
        res.render("orgLogin", {
            loggedin: false
        });
    }
});


app.post("/orgLogin", async (req, res) => {
    try{
        var email = req.body.email;
        var password = req.body.password;

        var data = await org.findOne({email});
        //console.log(data);
        if(data)
        {
            const token = await data.generateAuthToken();
            //console.log(token);

            res.cookie("jwt", token, {
                httpOnly: true
            });

            var hash = await bcrypt.compare(password, data.password, async (err, resp) => {
                
                var name = data.name;
                var email = data.email;

                var status = 'waiting for buyer';

                //var orgdata = await seller.find({status: status});

                //console.log(data);

                // res.render("organisationHome", {
                //     data: data,
                //     n: req.body.name,
                //     e: req.body.email,
                //     orgLoggedin: true
                // });
                if(resp == true )
                {
                    console.log("Password match");
                    res.render("recyclepage", {
                        n: name,
                        e: email,
                        orgLoggedin: true
                    });
                }
                else{
                    console.log("Password not match");
                    res.render("orgLogin", {
                        msg: "Incorrect Password"
                    });
                }
            });
        }
        else{
            res.render("orgLogin", {
                msg: "Invalid email"
            })
        }
    }
    catch(error)
    {
        console.log(error);
    }

});

app.get("/sell", (req, res) => {
    res.render("form");
});

app.post("/sell", async (req, res) => {
    
    try{

        let id;

        if(data.length == 0)
        {
            id = 1111;
        }
        else{
            let max = data[0].wasteId;
            for(i=1;i<data.length;i++)
            {
                if(max < data[i].wasteId)
                {
                    max = data[i].wasteId;
                }
            }
            id = max+1;
        }

        const newSeller = new seller({
            wasteId: id,
            type: req.body.type.toLowerCase(),
            address: req.body.address.toLowerCase(),
            city: req.body.city.toLowerCase(),
            status: `Waiting for buyer`.toLowerCase(),
            img: req.file.filename
        })
        
        const result = await newSeller.save();
        console.log("Data successfully inserted");

        res.render("form", {
            successMsg: "Thank you for recycling your waste"
        });
    
    }catch(error){

        console.log(error);
        res.render("form", {
            failMsg: "Service is currently not available in your city"
        });
    }
});

app.get("/profile", async (req, res) => {
    try{
        const token = req.cookies.jwt;
        const verify = jwt.verify(token, "wastearndevelopedbyteamblackpearl");
        var data = await user.findOne({_id: verify._id});
        var name = data.name;
        var email = data.email;
        res.render("profile", {
            n: name,
            e: email
        });
    }
    catch(e){
        console.log(e);
    }
})

app.get("/logout", async (req, res) => {
    try{
        const token = req.cookies.jwt;
        const verify = jwt.verify(token, "wastearndevelopedbyteamblackpearl");

        const data = await user.findOne({_id: verify._id});
        const orgData = await org.findOne({_id: verify._id});

        if(data){
        data.tokens = data.tokens.filter((d) => {
            return d.token != token;
        })
        
        res.clearCookie("jwt");
        await data.save();
        res.render("login", {
            loggedin: false
        });
        }
        else if(orgData){
        orgData.tokens = orgData.tokens.filter((d) => {
        return d.token != token;

        })
        res.clearCookie("jwt");
        await orgData.save();
        res.render("orgLogin", {
            orgLoggedin: false
        });
        }
    }
    catch(e){
        console.log(e);
    }
})

app.listen(port, () => {
    console.log("Server is running on port number 8000");
});