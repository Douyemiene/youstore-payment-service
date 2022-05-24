import { Router, Request, Response, NextFunction } from "express";
//import { sendBadRequestErrorResponse } from "../reqValidation";
import { verifyCustomer, verifyMerchant } from "../../../middlewares";
import container from "../../../di-setup";

const { paymentController } = container.cradle;

const PaymentRouter = Router();

// /payment-
PaymentRouter.post("/paystack-webhook", (req: Request, res: Response) =>
  paymentController.consumePaystackEvent(req, res)
);

PaymentRouter.post("/transfer", verifyMerchant, (req: Request, res: Response) =>
paymentController.bankTransfer(req, res))

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


export { PaymentRouter };
