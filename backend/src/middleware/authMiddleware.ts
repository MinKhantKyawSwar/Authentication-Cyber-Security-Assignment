import { Request, Response, NextFunction } from "express";
import TokenService from "../services/TokenService";
import UserModel from "../models/User";

export const authMiddleware = (tokenService: TokenService) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers["authorization"];

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Missing token" });
      }

      const token = authHeader.split(" ")[1];

      const { userId } = await tokenService.verifyAccessToken(token);

      // Fetch user data from database
      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      req.user = {
        id: userId,
        email: user.email,
        name: user.name || user.email.split("@")[0],
      };
      next();
    } catch (err) {
      res.status(401).json({ message: "Unauthorized" });
    }
  };
};
