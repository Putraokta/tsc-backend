import { NextFunction, Request, Response } from "express";
import { IAuthRequest } from "../utils/interfaces";
import { verifyAccessToken } from "../utils/jwt";
import { changePasswordValidate, loginValidate, registerValidate } from "../validators/auth.validate";
import { error } from "../utils/response";

const validateLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await loginValidate.validate(req.body, { abortEarly: false });
    next();
  } catch (err) {
    error(res, err, "invalid login data");
  }
};

const validateRegister = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await registerValidate.validate(req.body, { abortEarly: false });
    next();
  } catch (err) {
    error(res, err, "invalid register data");
  }
};

const authorization = async (req: IAuthRequest, res: Response, next: NextFunction) => {
  let token = req.cookies?.token
  if (!token) {
    const authHeader = req.headers?.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  } else {
    return error(res, null, "Unauthorized access");
  }

  token = authHeader.substring(7);
  }

  if (!token) {
    return res.status(401).json({ message: "Unauthorized access" });
  }

  const userData = verifyAccessToken(token);

  if (!userData) {
    return error(res, null, "Invalid or expired token");
  }

  req.user = {
    _id: userData._id,
    role: userData.role,
  };

  next();
};

const validateChangePassword = async (req: IAuthRequest, res: Response, next: NextFunction) => {
  try {
    await changePasswordValidate.validate(req.body, { abortEarly: false });
    next();
  } catch (err) {
    error(res, err, "Invalid change password data");
  }
};

export default { validateLogin, validateRegister, authorization, validateChangePassword };