const mongoose = require("mongoose");

export const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  console.log(`MongoDB Connected ${conn.connection.host}`);
};

export default connectDB;
