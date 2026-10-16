const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

const User = require("./models/user");

dotenv.config();

const createUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB connected");

        const password = await bcrypt.hash("123456", 10);



        console.log("Users created successfully");

        process.exit();

    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

createUsers();