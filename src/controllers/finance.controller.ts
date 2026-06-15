import { Response } from "express";
import FinanceModel from "../models/finance.model";
import { error, pagination, success, unauthorized } from "../utils/response";
import { IAuthRequest, IPagination } from "../utils/interfaces";

export default {
    async create(req: IAuthRequest, res: Response) {
        try {
            if (!req.user || !req.user._id) return unauthorized(res);
            req.body.user = req.user._id;
            // accept optional `date` from client; ensure it's a Date
            if (req.body.date) {
                req.body.date = new Date(req.body.date);
            }

            const result = await FinanceModel.create(req.body);
            success(res, result, "Finance created successfully");
        } catch (err) {
            error(res, err, "Failed to create finance");
        }
    },

    async findAll(req: IAuthRequest, res: Response) {
        const { page = 1, limit = 10, search } = req.query as unknown as IPagination;

        try {
            const query: any = {};

            // text search against description
            if (search){
                Object.assign(query, {
                    description: { $regex: search, $options: "i" },
                });
            }

            // date range filtering using `date` field
            const { startDate, endDate } = req.query as unknown as { startDate?: string; endDate?: string };
            if (startDate || endDate) {
                query.date = {};
                if (startDate) query.date.$gte = new Date(startDate);
                if (endDate) query.date.$lt = new Date(endDate);
            }

            const [count, results] = await Promise.all([
                FinanceModel.countDocuments(query),
                FinanceModel.find(query)
                    .skip((+page - 1) * +limit)
                    .limit(+limit)
                    .sort({ createdAt: -1 })
                    .exec(),
            ]);

            pagination(res, "Successfully retrieved finances", { total: count, totalPages: Math.ceil(count / limit), currentPage: Number(page) }, results);
        } catch (err) {
            error(res, err, "Failed to retrieve finances");
        }
        
            
    },

    async findOne(req: IAuthRequest, res: Response) {
        try {
            const { id } = req.params;
            const result = await FinanceModel.findById(id);
            success(res, result, "Finance retrieved successfully");
        } catch (err) {
            error(res, err, "Failed to retrieve finance");
        }
    },

    async update(req: IAuthRequest, res: Response) {
        try {
            const { id } = req.params;
            if (req.body.date) {
                req.body.date = new Date(req.body.date);
            }
            const result = await FinanceModel.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
            if (!result) {
                return error(res, null, "Finance not found", 404);
            }
            success(res, result, "Finance updated successfully");
        } catch (err) {
            error(res, err, "Failed to update finance");
        }
    },

    async delete(req: IAuthRequest, res: Response) {
        try {
            const { id } = req.params;
            const result = await FinanceModel.findByIdAndDelete(id);
            if (!result) {
                return error(res, null, "Finance not found", 404);
            }
            success(res, null, "Finance deleted successfully");
        } catch (err) {
            error(res, err, "Failed to delete finance");
        }
    },
};