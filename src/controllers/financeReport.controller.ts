import { Response } from "express";
import FinanceModel from "../models/finance.model";
import { success, error, unauthorized } from "../utils/response";
import { IAuthRequest } from "../utils/interfaces";

export default {
    async monthly(req: IAuthRequest, res: Response) {
        try {
            if (!req.user || !req.user._id) return unauthorized(res);

            const year = Number(req.query.year) || new Date().getFullYear();
            const month = Number(req.query.month) || (new Date().getMonth() + 1);

            const start = new Date(year, month - 1, 1);
            const end = new Date(year, month, 1);

            // aggregate by `date` field (uses model's `date` with default Date.now)
            const match: any = { date: { $gte: start, $lt: end } };

            const agg = await FinanceModel.aggregate([
                { $match: match },
                { $group: { _id: "$type", total: { $sum: "$balance" }, count: { $sum: 1 } } },
            ]);

            let income = 0;
            let expense = 0;
            agg.forEach((g: any) => {
                if (g._id === "income") income = g.total;
                if (g._id === "expense") expense = g.total;
            });

            const net = income - expense;

            const details = await FinanceModel.find(match).sort({ date: -1 }).lean().exec();

            success(res, { year, month, income, expense, net, details }, "Monthly finance report");
        } catch (err) {
            error(res, err, "Failed to generate monthly report");
        }
    },
};
