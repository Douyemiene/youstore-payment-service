import { Router, Request, Response} from "express";
import container from "../../../di-setup";
import { verifyMerchant } from "../../../middlewares";

const { transferController} = container.cradle;

const TransferRouter = Router();

TransferRouter.get("/merchant/:id", verifyMerchant, (req: Request, res: Response) =>
transferController.getTransferByCustomer(req, res))



export { TransferRouter };
