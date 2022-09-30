import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
const url = process.env.URL;
async function dbConnect() {
  try {
    await mongoose.connect(url, { useNewUrlParser: true });
    console.log("database connection successfully....");
  } catch (error) {
    console.log(error);
  }
}
async function dbClose() {
  try {
    await mongoose.connection.close(() =>
      console.log("database connection terminated...")
    );
  } catch (error) {
    console.log(error);
  }
}

export { dbConnect, dbClose };
