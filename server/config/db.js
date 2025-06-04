// server/config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            // Mongoose 6 doesn't need these options anymore, but good to be aware of:
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
            // useCreateIndex: true, // no longer supported
            // useFindAndModify: false // no longer supported
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1); // Exit process with failure
    }
};

module.exports = connectDB;