import express from "express";
import { connectDB } from "../../../infra/database/mongoose";
import { PaymentRouter } from "./payments";
import container from "../../../di-setup";

const app = express();
app.use(express.json());
app.use("/payments", PaymentRouter);

const { messenger, paymentUseCase } = container.cradle;

app.post("/", async (req, res) => {
  const body = req.body;
  try {
    const data = await paymentUseCase.createPayment({ ...body, status: null });
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(200).json({ success: true, err });
  }
});
messenger.createChannel().then(() => {
  //connect database
  connectDB();
  //listen for requests
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
