const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const buyerSchema = new mongoose.Schema({

    orgName: String,
    name: String,
    pincode: Number,
    city: String,
    description: String,
    email: String,
    password: String,
    phone: Number,
    tokens: [{
        token: String
    }]
});

buyerSchema.methods.generateAuthToken = async function(){
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

module.exports = org = mongoose.model('org', buyerSchema);