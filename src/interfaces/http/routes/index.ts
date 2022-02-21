import express from "express";
import { connectDB } from "../../../infra/database/mongoose";
import { OrderRouter } from "./orders";
import container from "../../../di-setup";

const app = express();
app.use(express.json());
app.use("/orders", OrderRouter);

const { messenger } = container.cradle;

messenger.createChannel().then(() => {
  //connect database
  connectDB();
  //consume events
  // messenger.assertQueue("payment_success");
  // messenger.assertQueue("payment_failure");
  messenger.consumePaymentSuccess();
  messenger.consumePaymentFailure();
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
