import mongoose from "mongoose";

async function connectDB() {
    try {
        const connect = await mongoose.connect(process.env.MONGODB_URL)
        console.log(`connect To DB: ${connect.connection.host}`)
    }
    catch (err) {
        console.log(err);
        process.exit(1);
    }
}

mongoose.connection.on("error", (err) => {
    console.log(`MongoDB connection error: ${err}`);
});

process.on("SIGINT", async () => {
    await mongoose.connection.close();
    console.log("MongoDB connection closed due to app termination");
    process.exit(0);
});

export default connectDB;
