import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
        const connectionIntansce = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        console.log(`\n MongoDB connected !! DB HOST : ${connectionIntansce.connection.host}`);
       
        
    } catch (error) {
        console.log("MONGODB is not available", error);
        process.exit(1);
        
    }
}

export default connectDB;