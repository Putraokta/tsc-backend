import { Request } from 'express';
import { Types } from 'mongoose';
import { ROLES } from './contants';

export interface IUser {
    _id: Types.ObjectId;
    username: string;
    email: string;
    password: string;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    role: ROLES;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface ITokenPayload {
    _id: string;
    role: ROLES;
}

export interface IAuthRequest extends Request {
    user?: ITokenPayload;
}

export interface IPagination {
    page: number;
    limit: number;
    search?: string;
    school?: string;
}