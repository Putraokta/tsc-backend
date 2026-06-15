import { Response } from "express";
import { IAuthRequest, IPagination } from "../utils/interfaces";
import { error, pagination, success, unauthorized } from "../utils/response";
import CoachModel from "../models/coach.model";

export default {
    async create(req: IAuthRequest, res: Response) {
        try {
            if (!req.user || !req.user._id) return unauthorized(res);
            req.body.user = req.user._id;
            // map incoming schoolIds -> schools for the model
            if (req.body.schoolIds) {
                req.body.schools = req.body.schoolIds;
                delete req.body.schoolIds;
            }
            const result = await CoachModel.create(req.body);
            success(res, result, "Coach created successfully");
        } catch (err) {
            error(res, err, "Failed to create coach");
        }
    },

    async findAll(req: IAuthRequest, res: Response) {
        const { page = 1, limit = 1000, search } = req.query as unknown as IPagination;

        try {
            const query: any = {isActive: { $ne: false }};
            if (search){
                Object.assign(query, {
                         name: { $regex: search, $options: "i" },
                });
            }

            const [count, results] = await Promise.all([
                CoachModel.countDocuments(query),
                CoachModel.find(query)
                    .skip((+page - 1) * +limit)
                    .limit(+limit)
                    .sort({ createdAt: -1 })
                    .exec(),
            ]);

            pagination(res, "Successfully retrieved coaches", { total: count, totalPages: Math.ceil(count / limit), currentPage: Number(page) }, results);
        } catch (err) {
            error(res, err, "Failed to retrieve coaches");
        }
        
            
    },

    async findOne(req: IAuthRequest, res: Response) {
        try {
            const { id } = req.params;
            const result = await CoachModel.findById(id);
            success(res, result, "Coach retrieved successfully");
        } catch (err) {
            error(res, err, "Failed to retrieve coach");
        }
    },

    async update(req: IAuthRequest, res: Response) {
        try {
            const { id } = req.params;
            // prevent client from changing owner
            if (req.body.user) delete req.body.user;
            // map schoolIds -> schools when updating
            if (req.body.schoolIds) {
                req.body.schools = req.body.schoolIds;
                delete req.body.schoolIds;
            }
            const result = await CoachModel.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

            if (!result) {
                return error(res, null, "Coach not found", 404);
            }

            success(res, result, "Coach updated successfully");
        } catch (err) {
            if (err instanceof Error && "code" in err && err.code === 11000) {
                return error(res, { message: "Duplicate key error"}, "Failed to update coach due to duplicate key");
            }
        }
    },

    async remove(req: IAuthRequest, res: Response) {
        try {
            const { id } = req.params;
            const result = await CoachModel.findByIdAndUpdate(id, { isActive: false }, { new: true });

            if (!result) {
                return error(res, null, "Coach not found", 404);
            }

            success(res, null, "Coach deleted successfully");
        } catch (err) {
            error(res, err, "Failed to delete coach");
        }
    },
};