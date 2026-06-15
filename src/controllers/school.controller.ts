import { Response } from "express";
import { IAuthRequest, IPagination } from "../utils/interfaces";
import SchoolModel from "../models/school.model";
import CoachModel from "../models/coach.model";
import { ROLES } from "../utils/contants";
import { error, pagination, success } from "../utils/response";

export default {
    async createShool(req: IAuthRequest, res: Response) {
        try {
            const { name, address } = req.body as { name?: any; address?: any };

            if (!name || typeof name !== "string") {
                return error(res, null, "Name is required and must be a string", 400);
            }

            const payload: any = { name };
            if (address && typeof address === "string") payload.address = address;

            const result = await SchoolModel.create(payload);
            success(res, result, "School created successfully");
        } catch (err) {
            error(res, err, "Failed to create school");
        }
    },

    async findAllSchools(req: IAuthRequest, res: Response) {
        const { page = 1, limit = 10, search = "" } = req.query as unknown as IPagination;

        try {
            const query: any = { isActive: { $ne: false } };

            // Scope: if the user is a coach, only return their assigned schools
            if (req.user?.role === ROLES.PELATIH) {
                const coach = await CoachModel.findById(req.user._id).select("schools");
                const schoolIds = coach?.schools || [];
                query._id = { $in: schoolIds };
            }

            if (search) {
                query.name = { $regex: search, $options: "i" };
            }

            const [count, result] = await Promise.all([
                SchoolModel.countDocuments(query),
                SchoolModel.find(query)
                    .limit(limit)
                    .skip((page - 1) * limit)
                    .sort({ createdAt: -1 })
                    .exec(),
            ]);
            pagination(res, "Successfully retrieved schools", { total: count, totalPages: Math.ceil(count / limit), currentPage: Number(page) }, result);
        }
        catch (err) {
            error(res, err, "Failed to retrieve schools");
        }
    },

    async findOne(req: IAuthRequest, res: Response) {
        try {
            const { id } = req.params;
            const result = await SchoolModel.findById(id);
            success(res, result, "School retrieved successfully");
        } catch (err) {
            error(res, err, "Failed to retrieve school");
        }
    },

    async updateSchool(req: IAuthRequest, res: Response) {
        try {
            const { id } = req.params;
            const { name, address } = req.body as { name?: any; address?: any };

            const payload: any = {};
            if (name && typeof name === "string") payload.name = name;
            if (address && typeof address === "string") payload.address = address;

            const result = await SchoolModel.findByIdAndUpdate(id, payload, { new: true, runValidators: true });

            if (!result) {
                return error(res, null, "School not found", 404);
            }

            success(res, result, "School updated successfully");
        } catch (err) {
            error(res, err, "Failed to update school");
        }
    },

    async deleteSchool(req: IAuthRequest, res: Response) {
        try {
            const { id } = req.params;
            const result = await SchoolModel.findByIdAndUpdate(id, { isActive: false }, { new: true });

            if (!result) {
                return error(res, null, "School not found", 404);
            }

            success(res, null, "School deleted successfully");
        } catch (err) {
            error(res, err, "Failed to delete school");
        }
    },
};