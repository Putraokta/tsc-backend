import { IAuthRequest } from "../utils/interfaces";
import { NextFunction, Response } from "express";
import { error } from "../utils/response";

export default (roles: string[]) => {
    return (req: IAuthRequest, res: Response, next: NextFunction) => {
        const userRole = req.user?.role;

        if (!userRole || !roles.includes(userRole)) {
            return error(res, null, "Forbidden access");
        }
        next();
    };
}
