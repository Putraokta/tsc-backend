import { Response } from "express";
import { IAuthRequest, IPagination } from "../utils/interfaces";
import { error, pagination, success, unauthorized } from "../utils/response";
import AthleteModel from "../models/athlete.model";
import CoachModel from "../models/coach.model";
import { ROLES } from "../utils/contants";
import mongoose from "mongoose";

export default {
  async create(req: IAuthRequest, res: Response) {
    try {
      if (!req.user?._id) return unauthorized(res);

      req.body.user = req.user._id;

      // 🔥 Pastikan schools dikonversi ke ObjectId
      if (!Array.isArray(req.body.schools) || req.body.schools.length === 0) {
        return error(res, null, "At least one school is required", 400);
      }

      req.body.schools = req.body.schools.map(
        (id: string) => new mongoose.Types.ObjectId(id)
      );


      const result = await AthleteModel.create(req.body);

      success(res, result, "Athlete created successfully");
    } catch (err) {
      error(res, err, "Failed to create athlete");
    }
  },

  async findAll(req: IAuthRequest, res: Response) {
    const {
      page = 1,
      limit = 10,
      search,
    } = req.query as unknown as IPagination;

    try {
      const query: any = { isActive: { $ne: false } };

      // Scope: if the user is a coach, only return athletes in their schools
      if (req.user?.role === ROLES.PELATIH) {
        const coach = await CoachModel.findById(req.user._id).select("schools");
        const schoolIds = coach?.schools || [];
        query.schools = { $in: schoolIds };
      }

      if (search) {
        Object.assign(query, {
          name: { $regex: search, $options: "i" },
        });
      }

      const [count, results] = await Promise.all([
        AthleteModel.countDocuments(query),
        AthleteModel.find(query)
          .skip((+page - 1) * +limit)
          .limit(+limit)
          .sort({ createdAt: -1 })
          .exec(),
      ]);

      pagination(
        res,
        "Successfully retrieved athletes",
        {
          total: count,
          totalPages: Math.ceil(count / limit),
          currentPage: Number(page),
        },
        results,
      );
    } catch (err) {
      error(res, err, "Failed to retrieve athletes");
    }
  },

  async findOne(req: IAuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const result = await AthleteModel.findById(id);
      success(res, result, "Athlete retrieved successfully");
    } catch (err) {
      error(res, err, "Failed to retrieve athlete");
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
      const result = await AthleteModel.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
      });

      if (!result) {
        return error(res, null, "Athlete not found", 404);
      }

      success(res, result, "Athlete updated successfully");
    } catch (err) {
      if (err instanceof Error && "code" in err && err.code === 11000) {
        return error(
          res,
          { message: "Duplicate key error" },
          "Failed to update athlete due to duplicate key",
        );
      }
    }
  },

  async remove(req: IAuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const result = await AthleteModel.findByIdAndUpdate(
        id,
        { isActive: false },
        { new: true },
      );

      if (!result) {
        return error(res, null, "Athlete not found", 404);
      }

      success(res, null, "Athlete deleted successfully");
    } catch (err) {
      error(res, err, "Failed to delete athlete");
    }
  },

  async findByUser(req: IAuthRequest, res: Response) {
    const { page = 1, limit = 10 } = req.query as unknown as IPagination;

    try {
      if (!req.user?._id) {
        return unauthorized(res);
      }

      const query = {
        user: req.user._id,
        isActive: { $ne: false },
      };

      const [count, athletes] = await Promise.all([
        AthleteModel.countDocuments(query),
        AthleteModel.find(query)
          .skip((+page - 1) * +limit)
          .limit(+limit)
          .sort({ createdAt: -1 }),
      ]);

      pagination(
        res,
        "Successfully retrieved athletes by user",
        {
          total: count,
          totalPages: Math.ceil(count / +limit),
          currentPage: +page,
        },
        athletes,
      );
    } catch (err) {
      error(res, err, "Failed to retrieve athletes by user");
    }
  },
};
