import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const verifyCustomer = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token: string | undefined = req.header("auth-token");
  if (!token) res.status(401).json({ message: "unauthorised" });
  else {
    const secret = process.env.CUSTOMER_JWT_SECRET;

    try {
      // verify token and save customer Id to the verified variable
      const payload = jwt.verify(token, `${secret}`);
      next();
    } catch (error) {
      res.status(401).json({ message: "unauthorised" });
    }
  }
};
