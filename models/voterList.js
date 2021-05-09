const mongoose = require("mongoose");

const voterSchema = new mongoose.Schema({
    userId: {type: String, unique: false},
    wasteId: {type: String, unique: true}
});

const voterList = new mongoose.model("voterList", voterSchema);

module.exports = voterList;