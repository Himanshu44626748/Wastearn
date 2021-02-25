const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const hbs = require("hbs");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const app = express();
const multer = require("multer");
const StreamrClient = require('streamr-client')
const port = process.env.PORT || 8000;
// const firebase = require("firebase");
const { auth } = require("./firebase");
const privatekey = 'fc8f0ba4f6e15133610ae5ca19d34de270280ed60dadf494f052a2878fb5515c'
const SHARED_SECRET = 'xd5Y8XmDT-OArm3gjxgfGgydnt5FwcQ8yamal29m9Dsw'
const DU_CONTRACT = '0x2bca3b92f79d7ffb5f5a3cfa8dbcafd90a36def3'
const STREAM_ID = '0x7b3fe72fd7a05839bd122c5cefc9964d15225aba/wastearn/v2'
const WALLET_ADDRESS = '0x7B3Fe72Fd7A05839bd122c5CeFC9964d15225ABA'



const streamr = new StreamrClient({
    auth: {
        privateKey: privatekey
    },
    url: 'wss://hack.streamr.network/api/v1/ws',
    restUrl: 'https://hack.streamr.network/api/v1',
})


streamr.joinDataUnion(DU_CONTRACT, SHARED_SECRET)
.then((memberDetails) => {
        // console.log(memberDetails);

        streamr.getMemberStats(DU_CONTRACT, WALLET_ADDRESS)
            .then((stats) => {
                // console.log(stats);
            })
            .catch((err) => {
                console.log(err.message);
            })
    })
    .catch((err) => {
        console.log(err.message);
    })
    

function pushUserDataToStream(userName, city, description, email, phone) {

    streamr.publish(STREAM_ID, { 
        userName : userName,
        city : city,
        email : email,
        description : description,
        phone : phone
    })
    // console.log("Data Published");
}

function pushOrganisationDataToStream(orgName, city, description, email, phone) {

    streamr.publish(STREAM_ID, { 
        orgName : orgName,
        city : city,
        email : email,
        description : description,
        phone : phone
    })
    // console.log("Data Published");
}



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
    wasteId: Number,
    name: String,
    city: String,
    description: String,
    email: String,
    phone: Number,
    status: String,
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

    pushOrganisationDataToStream(req.body.orgName, req.body.city, req.body.description, req.body.email, req.body.phone );
    const result = await newBuyer.save();
    // console.log(req.body.email);

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

// const Data = null;
app.post("/sell", upload, async (req, res) => {
    
    try{

        let id;

        let data = await seller.find({});
        const orgCity = await buyer.find({city: req.body.city});

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
            name: req.body.name.toLowerCase(),
            city: req.body.city.toLowerCase(),
            description: req.body.description.toLowerCase(),
            email: req.body.email,
            phone: req.body.phone,
            status: `Waiting for buyer`.toLowerCase(),
            img: req.file.filename
        })
        const userName = req.body.name;
        // Data = userName;
        
        pushUserDataToStream(id, req.body.name, req.body.city, req.body.description, req.body.email, req.body.phone);

        const result = await newSeller.save();

        //console.log(orgCity);
    
        if(orgCity[0].city)
        {
        
            const orgMail = {
                from: req.body.email,
                to: orgCity[0].email,
                subject: `${id} Waste Found`,
                text: `${req.body.name} is selling their waste(waste id - ${id}) please collect it from ${req.body.city}. His contact number is - ${req.body.phone} and Email id is - ${req.body.email}`
            }

            const sellerMail = {
                from: req.body.email,
                to: req.body.email,
                subject: "Thank you for recycling your waste",
                text: `Dear ${req.body.name} thank you for recycling. Your waste id is ${id}`
            }
    
            console.log("Data successfully inserted");
    
            res.render("form", {
                successMsg: "Thank you for recycling your waste"
            });

            transporter.sendMail(sellerMail, (error, info) => {
                if(error){
                    console.log(error)
                }
                else{
                    console.log("Mail sended to seller");
                }
            })
            
            transporter.sendMail(orgMail, (error, info) => {
                if(error){
                    console.log(error);
                }else{
                    console.log("Mail sended to organisation");
                }
            })
        }
    }catch(error){

        console.log(error);
        res.render("form", {
            failMsg: "Service is currently not available in your city"
        });
    }

});

app.get("/org", (req, res) => {
    res.render("organisation", {
        st: "none"
    });
})

app.post("/org", async (req, res) => {

    try{
        let t = await data.available(req, res, buyer);
        //console.log(t);
        
        let msg = "";

        if(t.length == 0)
        {
            msg = "No organisation found";
        }

        //console.log(msg);

        res.render("organisation", {
            org: t,
            msg: msg
        });
    }
    catch(error){
        res.render("organisation");
        //console.log(error);
    }
    //console.log(t[0].orgName);

});

app.get("/checkStatus", (req, res) => {
    res.render("checkStatus");
});

app.post("/checkStatus", async (req, res) => {

    try{

        let wasteId = req.body.id;

        let data = await seller.find({wasteId: wasteId});

        //console.log(data);

        if(data.length == 1)
        {
            res.render("checkStatus", {
                msg: `Current Status - ${data[0].status}`,
                id: req.body.id
            })
        }
        else{
            res.render("checkStatus", {
                error: `No waste found`,
                id: req.body.id
            })
        }

    }
    catch(error)
    {
        console.log(error);
    }
})

app.get("/updateStatus", (req, res) => {
    res.render("updateStatus");
});

app.post("/updateStatus", async (req, res) => {

    var id = req.body.id;
    var status = req.body.status;

    let data = await seller.find({wasteId: id});
    if(data.length == 1)
    {
        await seller.updateOne({wasteId: id}, {status: status});

        res.render("updateStatus", {
            msg: "Updated"
        });
        
    }
    else{
        res.render("updateStatus", {
            error: "Wrong waste id"
        });
    }
    

});

app.get("/orgHome", async(req, res) => {

    var status = 'waiting for buyer';

    var data = await seller.find({status: status});

    //console.log(data);

    res.render("organisationHome", {
        data: data
    });
});

app.post("/orgHome", async(req, res) => {

    try{

        var filter = req.body.filter.toLowerCase();

        var status = 'waiting for buyer';

        if(filter === "bio" || filter === "metal" || filter === "plastic" || filter === "paper")
        {
            var data = await seller.find({status: status, description: filter});

            //console.log(filter);

            if(data.length == 0)
            {
                res.render("organisationHome", {
                    msg: "No Waste Found"
                });
            }

            else{
                res.render("organisationHome", {
                    data: data
                });
            }
        }
        else{
            var data = await seller.find({status: status, city: filter});

            //console.log(filter);
            
            if(data.length == 0)
            {
                res.render("organisationHome", {
                    msg: "No Waste Found"
                });
            }

            else{
                res.render("organisationHome", {
                    data: data
                });
            }
        }

    }
    catch(error)
    {
        console.log(error);
    }

});


app.listen(port, () => {
    console.log("Server is running on port number 8000");
});