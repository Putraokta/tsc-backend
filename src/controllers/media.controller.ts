import { Request, Response } from "express";
import { error, success } from "../utils/response";
import imageKitUtil from "../utils/uploader";
import MediaModel from "../models/media.model";
import CoachModel from "../models/coach.model";
import AthleteModel from "../models/athlete.model";
import { ROLES } from "../utils/contants";
import { IAuthRequest } from "../utils/interfaces";

export default {
    async single(req: Request, res: Response) {
        if (!req.file) {
            return error(res, "No file uploaded", "No file uploaded");
        }
        try {
            const result = await imageKitUtil.uploadSingle(req.file as Express.Multer.File, "media");
            success(res, result, "File uploaded successfully");
        } catch (err) {
            error(res, err, "File upload failed");
        }
    },

    async multiple(req: Request, res: Response) {
        if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
            return error(res, "No files uploaded", "No files uploaded");
        }
        try {
            const results = await imageKitUtil.uploadMultiple(req.files as Express.Multer.File[], "media");
            success(res, results, "Files uploaded successfully");
        } catch (err) {
            error(res, err, "File upload failed");
        }
    },

    async remove(req: Request, res: Response) {
        const { fileId } = req.body;
        if (!fileId) {
            return error(res, "fileId ID is required", "fileId removal failed");
        }
        try {
            const result = await imageKitUtil.removeFile(fileId);
            success(res, result, "File removed successfully");
        } catch (err) {
            error(res, err, "File removal failed");
        }
    },

    // ── Mongoose Media Metadata Operations ────────────────────────────────────────

    async createMedia(req: IAuthRequest, res: Response) {
        try {
            if (!req.user || !req.user._id) {
                return error(res, "Unauthorized", "Authentication required", 401);
            }
            const { title, type, url, fileId, athleteId, schoolId } = req.body;
            if (!title || !type || !url || !fileId) {
                return error(res, "Missing fields", "Title, type, url, and fileId are required", 400);
            }

            const mediaData: any = {
                title,
                type,
                url,
                fileId,
                uploader: req.user._id,
            };

            if (athleteId) mediaData.athlete = athleteId;
            if (schoolId) mediaData.school = schoolId;

            const result = await MediaModel.create(mediaData);
            const populatedResult = await MediaModel.findById(result._id)
                .populate("athlete", "name")
                .populate("school", "name")
                .exec();

            success(res, populatedResult, "Media metadata created successfully");
        } catch (err) {
            error(res, err, "Failed to save media metadata");
        }
    },

    async listMedia(req: IAuthRequest, res: Response) {
        try {
            const { type, athleteId, schoolId, search } = req.query;
            const query: any = { isActive: { $ne: false } };

            if (type) query.type = type;
            if (athleteId) query.athlete = athleteId;
            if (schoolId) query.school = schoolId;
            if (search) {
                query.title = { $regex: search as string, $options: "i" };
            }

            // Scope: if the user is a coach, only return media they uploaded
            // or media related to their assigned schools/athletes
            if (req.user?.role === ROLES.PELATIH) {
                const coach = await CoachModel.findById(req.user._id).select("schools");
                const coachSchoolIds = coach?.schools || [];

                // Find athletes that belong to the coach's schools
                const athleteIds = await AthleteModel.find({
                    schools: { $in: coachSchoolIds },
                    isActive: { $ne: false },
                }).distinct("_id");

                query.$or = [
                    { uploader: req.user._id },
                    { school: { $in: coachSchoolIds } },
                    { athlete: { $in: athleteIds } },
                ];
            }

            const results = await MediaModel.find(query)
                .populate("athlete", "name")
                .populate("school", "name")
                .sort({ createdAt: -1 })
                .exec();

            success(res, results, "Successfully retrieved media list");
        } catch (err) {
            error(res, err, "Failed to retrieve media list");
        }
    },

    async deleteMedia(req: IAuthRequest, res: Response) {
        try {
            const { id } = req.params;
            const media = await MediaModel.findById(id);

            if (!media) {
                return error(res, null, "Media not found", 404);
            }

            // 1. Remove physical file from ImageKit
            if (media.fileId) {
                try {
                    await imageKitUtil.removeFile(media.fileId);
                } catch (ikErr) {
                    console.error("Failed to delete physical file from ImageKit:", ikErr);
                    // Continue with database deletion even if physical deletion fails
                }
            }

            // 2. Hard delete from database
            await MediaModel.findByIdAndDelete(id);

            success(res, null, "Media deleted successfully");
        } catch (err) {
            error(res, err, "Failed to delete media");
        }
    },

    async updateMedia(req: IAuthRequest, res: Response) {
        try {
            const { id } = req.params;
            const { title, type, url, fileId, athleteId, schoolId } = req.body;
            const media = await MediaModel.findById(id);

            if (!media) {
                return error(res, null, "Media not found", 404);
            }

            if (title) media.title = title;
            if (type) media.type = type;

            if (url) media.url = url;
            if (fileId) {
                if (media.fileId && media.fileId !== fileId) {
                    try {
                        await imageKitUtil.removeFile(media.fileId);
                    } catch (ikErr) {
                        console.error("Failed to delete old file from ImageKit:", ikErr);
                    }
                }
                media.fileId = fileId;
            }

            if (type === "sertifikat") {
                media.athlete = athleteId || null;
                media.school = null;
            } else if (type === "latihan") {
                media.school = schoolId || null;
                media.athlete = null;
            }

            await media.save();

            const populatedResult = await MediaModel.findById(id)
                .populate("athlete", "name")
                .populate("school", "name")
                .exec();

            success(res, populatedResult, "Media metadata updated successfully");
        } catch (err) {
            error(res, err, "Failed to update media metadata");
        }
    }
};