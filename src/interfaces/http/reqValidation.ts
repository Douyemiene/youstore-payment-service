import joi from "joi";
import { ExpressJoiError } from "express-joi-validation";
import { Request, Response, NextFunction } from "express";

const validator = require("express-joi-validation").createValidator({
  passError: true,
});

// export const validateConsumePaystackEvent = validator.body(
//   joi.object({
//     customerId: joi.string().required(),
//     total: joi.number().required(),
//     products: joi.array().items(
//       joi.object({
//         name: joi.string(),
//         quantity: joi.number(),
//       })
//     ),
//   })
// );

// export const validateGetPaymentById = validator.params(
//   joi.object({ id: joi.string().required() })
// );

export const sendBadRequestErrorResponse = (
  err: any | ExpressJoiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err) {
    const e: ExpressJoiError = err;
    let msg = "";
    if (e.error) {
      e.error.details.forEach((d, idx) => {
        if (idx == e.error.details.length - 1 && idx != 1) {
          msg += ` and ${d.message}`;
        } else {
          msg += `${d.message},`;
        }
      });
    }

    res.status(400).json({
      error: `bad request ${e.type}`,
      msg,
    });
  } else {
    res.status(500).end("internal server error");
  }
};
