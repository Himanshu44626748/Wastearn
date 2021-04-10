const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
    name: String,
    password: String,
    email: String,
    phone: Number,
    address: String,
    city: String,
    pincode: Number,
    wastes: [{
        type: String,
        address: String,
        city: String,
        state: String,
        status: String,
        img: String
    }],
    tokens: [{
        token: String
    }],
},
{ typeKey: '$type' })


userSchema.methods.generateAuthToken = async function(){
    try{
        //console.log(this._id);
        const token = await jwt.sign({_id: this._id}, "wastearndevelopedbyteamblackpearl");
        this.tokens = this.tokens.concat({token});
        await this.save();
        return token;
    }
    catch(e)
    {
        console.log(e);
    }
}

userSchema.methods.createNewSell = async function(type, address, city, state, status, img){
    try{
        const waste = {
            "type": type,
            "address": address,
            "city": city,
            "state": state,
            "status": status,
            "img": img
        }
        
        this.wastes = this.wastes.concat(waste);
        //console.log(this.wastes)
        await this.save();
    }
    catch(e)
    {
        console.log(e)
    }
}

const user = new mongoose.model("User", userSchema);

module.exports = user;