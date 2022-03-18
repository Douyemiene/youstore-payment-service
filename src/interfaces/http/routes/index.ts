import express from "express";
import { connectDB } from "../../../infra/database/mongoose";
import { PaymentRouter } from "./payments";
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

app.use("/", PaymentRouter);

const { messenger, paymentUseCase } = container.cradle;



messenger.createChannel().then(() => {
  //connect database
  connectDB();
  //listen for requests
  messenger.assertQueue("order_created");
  messenger.consumeOrderCreated();
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`running on port ${PORT}`);
  });
});

//handle unhandled promise rejection
// process.on("unhandledRejection", (err, promise) => {
//   server.close(() => process.exit(1));
// });
