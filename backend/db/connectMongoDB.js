import mongoose from "mongoose";    
const connectMongoDB = async () => {
    try {
        const conn  = await mongoose.connect(process.env.MONGO_URI)
        console.log(`MongoDB connected: ${conn.connection.host}`);
    } catch (error) {
        // Log the error message to the console             

        console.error(`MongoDB connection error: ${error.message}`);
        // Exit process with failure`);
        process.exit(1);
        
    }
}   

export default connectMongoDB;