import authService from "../services/auth.service";
import { Request, Response } from "express";
import { error, success } from "../utils/response";
import { nodeModuleNameResolver } from "typescript";
import { get } from "mongoose";
import UserModel from "../models/user.model";
import CoachModel from "../models/coach.model";
import { ROLES } from "../utils/contants";
import { IAuthRequest } from "../utils/interfaces";
import { TChangePassword, TRegister } from "../validators/auth.validate";

export default {
    async loginController(req: Request, res: Response) {
    try {
        const { user, accessToken } = await authService.loginService(req.body);

        res.cookie("token", accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days (1 week)
        });
        success(res, { user, accessToken }, "Login successful");
    } catch (err) {
      error(res, err, "Login failed");
    }
  },

  async logoutController(req: Request, res: Response) {
    try {
        res.cookie("token", "", {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 0,
        });
        success(res, null, "Logout successful");
    } catch (err) {
      error(res, err, "Logout failed");
    }
  },
  
 async getProfileController(req: IAuthRequest, res: Response) {
    try {
        const userid = req.user?._id;
        if (!userid) {
            return error(res, null, "User not authenticated", 404);
        }
        
        let userProfile = await UserModel.findById(userid).select("-password -__v");
        
        if (!userProfile) {
            const coachProfile = await CoachModel.findById(userid).select("-password -__v");
            if (coachProfile) {
                const coachObj = coachProfile.toObject();
                userProfile = {
                    ...coachObj,
                    role: ROLES.PELATIH,
                } as any;
            }
        }

        if (!userProfile) {
            return error(res, null, "User not found", 404);
        }

        success(res, userProfile, "Profile retrieved successfully");
    } catch (err) {
      error(res, err, "Failed to retrieve profile");
    }
 },

 async changePasswordController(req: IAuthRequest, res: Response) {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return error(res, null, "User not authenticated", 404);
        }

        const passwordData : TChangePassword = req.body;
        await authService.changePasswordService(userId, passwordData);
        success(res, null, "Password changed successfully");
    }
    catch (err) {
      error(res, err, "Failed to change password");
    }
 },

 async registerController(req: Request, res: Response) {
    try {
        const payload : TRegister = req.body as any;
        const user = await authService.registerService(payload);
        success(res, user, "User registered successfully");
    } catch (err) {
      error(res, err, "Register failed");
    }
 },

 async coachLoginController(req: Request, res: Response) {
    try {
        const { user, accessToken } = await authService.coachLoginService(req.body);

        res.cookie("token", accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days (1 week)
        });
        success(res, { user, accessToken }, "Login successful");
    } catch (err) {
      error(res, err, "Login failed");
    }
 },

};  