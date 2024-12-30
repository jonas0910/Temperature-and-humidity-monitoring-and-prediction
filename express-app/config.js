const mongoose = require('mongoose');

const dbconnect = async () => {
     try{
        await mongoose.connect("mongodb://127.0.0.1:27017/temperature_humidity_db",{});
        console.log("Connected to the database");
     } catch (error) {
        console.log("Error connecting to the database. Exiting now...", error);
        process.exit(1);
     }
} 

module.exports = dbconnect;