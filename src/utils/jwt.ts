import { env } from "./env";
import { ITokenPayload } from "./interfaces";
import jwt from "jsonwebtoken";

const signToken = (payload: ITokenPayload, secret: string, expiresIn: string) => {
  return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
};

export const generateAuthTokens = (payload: ITokenPayload) => {
  if (!env.JWT_ACCESS_SECRET) {
    throw new Error("JWT Secrets are not defined in environment variables");
  }

  const tokenPayload: ITokenPayload = {
    _id: payload._id,
    role: payload.role,
  };

  const accessToken = signToken(tokenPayload, env.JWT_ACCESS_SECRET, env.JWT_ACCESS_EXPIRES_IN);

  return { accessToken };
};

export const verifyAccessToken = (token: string) => {
  try {
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as ITokenPayload;
  } catch (error) {
    return null;
  }
};