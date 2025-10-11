import mongoose from 'mongoose';
import { MONGO_URL } from '../../utils';

const connectDB = async ()=>{
    try{
       const conn = await mongoose.connect(MONGO_URL as string);
       if(conn){
            console.log("Connected to MongoDM and connection name is ", conn.connection.name)
       }
    } catch(err){
        console.error("Mongodb connection error", err)
        process.exit(1)
    }
}

export default connectDB;