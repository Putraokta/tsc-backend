import { Response } from "express";
import { IAuthRequest } from "../utils/interfaces";
import { success, error, unauthorized } from "../utils/response";

import AthleteModel from "../models/athlete.model";
import CoachModel from "../models/coach.model";
import SchoolModel from "../models/school.model";
import MediaModel from "../models/media.model";
import FinanceModel from "../models/finance.model";

import { FINANCE_TYPE } from "../utils/contants";

export default {
  async getStatistics(req: IAuthRequest, res: Response) {
    try {
      if (!req.user?._id) {
        return unauthorized(res);
      }

      const year = Number(req.query.year) || new Date().getFullYear();

      const startYear = new Date(year, 0, 1);
      const endYear = new Date(year + 1, 0, 1);

      const [
        totalAthletes,
        totalCoaches,
        totalSchools,
        totalMedia,
        incomeResult,
        expenseResult,
        yearlyAgg,
      ] = await Promise.all([
        AthleteModel.countDocuments({
          isActive: { $ne: false },
        }),

        CoachModel.countDocuments(),

        SchoolModel.countDocuments({
          isActive: { $ne: false },
        }),

        MediaModel.countDocuments({
          isActive: { $ne: false },
        }),

        FinanceModel.aggregate([
          {
            $match: {
              type: FINANCE_TYPE.INCOME,
            },
          },
          {
            $group: {
              _id: null,
              total: {
                $sum: "$balance",
              },
            },
          },
        ]),

        FinanceModel.aggregate([
          {
            $match: {
              type: FINANCE_TYPE.EXPENSE,
            },
          },
          {
            $group: {
              _id: null,
              total: {
                $sum: "$balance",
              },
            },
          },
        ]),

        FinanceModel.aggregate([
          {
            $match: {
              date: {
                $gte: startYear,
                $lt: endYear,
              },
            },
          },
          {
            $group: {
              _id: {
                month: {
                  $month: "$date",
                },
                type: "$type",
              },
              total: {
                $sum: "$balance",
              },
            },
          },
          {
            $sort: {
              "_id.month": 1,
            },
          },
        ]),
      ]);

      const totalIncome = incomeResult[0]?.total || 0;
      const totalExpense = expenseResult[0]?.total || 0;

      const MONTHS = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "Mei",
        "Jun",
        "Jul",
        "Agu",
        "Sep",
        "Okt",
        "Nov",
        "Des",
      ];

      const currentDate = new Date();

      const maxMonth =
        year === currentDate.getFullYear() ? currentDate.getMonth() + 1 : 12;

      const yearlyChart = Array.from({ length: maxMonth }, (_, index) => ({
        month: MONTHS[index],
        income: 0,
        expense: 0,
        balance: 0,
        runningBalance: 0,
      }));

      yearlyAgg.forEach((item: any) => {
        const monthIndex = item._id.month - 1;

        if (monthIndex >= yearlyChart.length) {
          return;
        }

        if (item._id.type === FINANCE_TYPE.INCOME) {
          yearlyChart[monthIndex].income = item.total;
        }

        if (item._id.type === FINANCE_TYPE.EXPENSE) {
          yearlyChart[monthIndex].expense = item.total;
        }

        yearlyChart[monthIndex].balance =
          yearlyChart[monthIndex].income - yearlyChart[monthIndex].expense;
      });

      let runningBalance = 0;

      yearlyChart.forEach((item) => {
        runningBalance += item.balance;
        item.runningBalance = runningBalance;
      });

      const statistics = {
        athletes: totalAthletes,
        coaches: totalCoaches,
        schools: totalSchools,
        media: totalMedia,
        totalIncome,
        totalExpense,
        currentBalance: totalIncome - totalExpense,
        yearlyChart,
      };

      success(res, statistics, "Dashboard statistics retrieved successfully");
    } catch (err) {
      error(res, err, "Failed to retrieve dashboard statistics");
    }
  },
};
