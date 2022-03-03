import { Router, Request, Response, NextFunction } from "express";
//import { sendBadRequestErrorResponse } from "../reqValidation";
import { verifyCustomer } from "../../../middlewares";
import container from "../../../di-setup";

const { paymentController } = container.cradle;

const PaymentRouter = Router();

// /payment-
PaymentRouter.post("/paystack-webhook", (req: Request, res: Response) =>
  paymentController.consumePaystackEvent(req, res)
);

PaymentRouter.use(verifyCustomer);

PaymentRouter.get("/:id", (req: Request, res: Response) =>
  paymentController.getpaymentById(req, res)
);

PaymentRouter.get("/reference/:reference", (req: Request, res: Response) =>
  paymentController.getpaymentByRef(req, res)
);

PaymentRouter.get("/verify/:reference", (req: Request, res: Response) =>
  paymentController.verifyPayment(req, res)
);

// PaymentRouter.use(sendBadRequestErrorResponse);
// // PaymentRouter.get("/hey/:id", (req: Request, res: Response) =>
// //   paymentController.findByIdAndUpdate(req, res)
// // );

export { PaymentRouter };