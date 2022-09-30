import mongoose from "mongoose";
const url = process.env.URL;
async function connection() {
  try {
    await mongoose.connect(url, { useNewUrlParser: true });
  } catch (error) {
    console.log(error);
  }
}

export default connection();
