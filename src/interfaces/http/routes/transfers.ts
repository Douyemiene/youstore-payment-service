import { Router, Request, Response} from "express";
import container from "../../../di-setup";

const { transferController} = container.cradle;

const TransferRouter = Router();

TransferRouter.get("/merchant/:id", (req: Request, res: Response) =>
transferController.getTransferByCustomer(req, res))



export { TransferRouter };
