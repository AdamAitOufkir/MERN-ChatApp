import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const protectRoute = async (req, res, next) => {
  try {
    //because we assign the name jwt to generated tokens (check generateToken)
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized - No Token" });
    }
    //we access by user id because we put the userId in the token (check generateToken)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized - Token Invalid" });
    }

    const user = await User.findById(decoded.userId).select("-password"); //select all minus password (dont send password to client)

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user;
    next(); //if user is present , call next function (updateProfile)
  } catch (error) {
    console.log("Error in protectRoute middleware: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
