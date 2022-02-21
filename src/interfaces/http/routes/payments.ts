import { Router, Request, Response, NextFunction } from "express";
import { sendBadRequestErrorResponse } from "../reqValidation";

import container from "../../../di-setup";

const { paymentController } = container.cradle;

const PaymentRouter = Router();

PaymentRouter.post("/paystack-webhook", (req: Request, res: Response) =>
  paymentController.consumePaystackEvent(req, res)
);

// PaymentRouter.use(sendBadRequestErrorResponse);
// // PaymentRouter.get("/hey/:id", (req: Request, res: Response) =>
// //   paymentController.findByIdAndUpdate(req, res)
// // );

export { PaymentRouter };
