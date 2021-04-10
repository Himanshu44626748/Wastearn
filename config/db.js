const mongoose = require('mongoose');
// const config = require('../config');
const db = 'mongodb+srv://himanshu446267:44626748@cluster0.76uy4.mongodb.net/himanshu?retryWrites=true&w=majority';

const connectDB = async () => {
    try {
        await mongoose.connect(db, { 
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true
        });

        console.log("Database connected");
    } catch (error) {
        console.log(error.message);
        process.exit(1)
    }
}

module.exports = connectDB;