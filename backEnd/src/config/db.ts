import mongoose from "mongoose";

export const connectDB = async () => { 
    try {
        const { connection } = await mongoose.connect(process.env.MONGO_URI)
        const paramConnect = `MongoDB: ${connection.name}:${connection.host}:${connection.port}`
        console.log(paramConnect)
    } catch (error) {
        console.log('MongoDB Error Conection: ', {error})
        process.exit(1)
    }
}