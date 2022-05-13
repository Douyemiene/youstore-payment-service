import express from "express";
import { connectDB } from "../../../infra/database/mongoose";
import { PaymentRouter } from "./payments";
import { TransferRouter } from "./transfers";
import container from "../../../di-setup";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors({
  origin: '*'
}))

app.get('/', (req,res)=> {
  res.json({message: 'Make your Payments with this API'})
})

app.use("/transfer", TransferRouter);

app.use("/", PaymentRouter);



const { messenger} = container.cradle;



messenger.createChannel().then(() => {
  //connect database
  connectDB();
  //listen for requests
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`running on port ${PORT}`);
  });
});

//handle unhandled promise rejection
// process.on("unhandledRejection", (err, promise) => {
//   server.close(() => process.exit(1));
// });
