import express from "express";
import authController from "../controllers/auth.controller";
import authMiddleware from "../middlewares/auth.middleware";
import aclMiddleware from "../middlewares/acl.middleware";
import { ROLES } from "../utils/contants";
import { schoolValidate } from "../validators/school.validate";
import schoolController from "../controllers/school.controller";
import { validate } from "../middlewares/validator.middleware";
import mediaController from "../controllers/media.controller";
import { coachValidate, coachLoginValidate } from "../validators/coach.validate";
import coachController from "../controllers/coach.controller";
import athleteController from "../controllers/athlete.controller";
import { athleteUpdateValidate, athleteValidate } from "../validators/athlete.validate";
import { financeValidate } from "../validators/finance.validate";
import financeController from "../controllers/finance.controller";
import financeReportController from "../controllers/financeReport.controller";
import statisticsController from "../controllers/statistics.controller";

import mediaMiddleware from "../middlewares/media.middleware";

const router = express.Router();

router.post("/auth/login", authMiddleware.validateLogin, authController.loginController);
router.post("/auth/register", authMiddleware.validateRegister, authController.registerController);
router.post("/auth/logout", authMiddleware.authorization, authController.logoutController);
router.get("/auth/profile", authMiddleware.authorization, authController.getProfileController);
router.post("/auth/change-password", authMiddleware.authorization, authMiddleware.validateChangePassword, authController.changePasswordController);
router.post("/auth/coach/login", validate(coachLoginValidate), authController.coachLoginController);

router.post("/schools", [authMiddleware.authorization, aclMiddleware([ROLES.PENGURUS]), validate(schoolValidate)], schoolController.createShool);
router.get("/schools", authMiddleware.authorization, schoolController.findAllSchools);
router.get("/schools/:id", authMiddleware.authorization, schoolController.findOne);
router.put("/schools/:id", [authMiddleware.authorization, aclMiddleware([ROLES.PENGURUS]), validate(schoolValidate)], schoolController.updateSchool);
router.delete("/schools/:id", [authMiddleware.authorization, aclMiddleware([ROLES.PENGURUS])], schoolController.deleteSchool);

router.post("/media/upload-single", [authMiddleware.authorization, mediaMiddleware.single("file")], mediaController.single);
router.post("/media/upload-multiple", [authMiddleware.authorization, mediaMiddleware.multiple("files", 10)], mediaController.multiple);
router.delete("/media/remove", authMiddleware.authorization, mediaController.remove);

router.post("/media", authMiddleware.authorization, mediaController.createMedia);
router.get("/media", authMiddleware.authorization, mediaController.listMedia);
router.put("/media/:id", authMiddleware.authorization, mediaController.updateMedia);
router.delete("/media/:id", authMiddleware.authorization, mediaController.deleteMedia);

router.post("/coaches", [authMiddleware.authorization, aclMiddleware([ROLES.PENGURUS]), validate(coachValidate)], coachController.create);
router.get("/coaches", authMiddleware.authorization, coachController.findAll);
router.get("/coaches/:id", authMiddleware.authorization, coachController.findOne);
router.put("/coaches/:id", [authMiddleware.authorization, aclMiddleware([ROLES.PENGURUS]), validate(coachValidate)], coachController.update);
router.delete("/coaches/:id", [authMiddleware.authorization, aclMiddleware([ROLES.PENGURUS])], coachController.remove);

router.post("/athletes", [authMiddleware.authorization, aclMiddleware([ROLES.PENGURUS, ROLES.PELATIH]), validate(athleteValidate)], athleteController.create);
router.get("/athletes", authMiddleware.authorization, athleteController.findAll);
router.get("/athletes/coach", authMiddleware.authorization, athleteController.findByUser);
router.get("/athletes/:id", authMiddleware.authorization, athleteController.findOne);
router.put("/athletes/:id", [authMiddleware.authorization, aclMiddleware([ROLES.PENGURUS, ROLES.PELATIH]), validate(athleteUpdateValidate)], athleteController.update);
router.delete("/athletes/:id", [authMiddleware.authorization, aclMiddleware([ROLES.PENGURUS, ROLES.PELATIH])], athleteController.remove);

router.post("/finances", [authMiddleware.authorization, aclMiddleware([ROLES.PENGURUS]), validate(financeValidate)], financeController.create);
router.get("/finances", authMiddleware.authorization, financeController.findAll);
router.get("/finances/:id", authMiddleware.authorization, financeController.findOne);
router.put("/finances/:id", [authMiddleware.authorization, aclMiddleware([ROLES.PENGURUS]), validate(financeValidate)], financeController.update);
router.delete("/finances/:id", [authMiddleware.authorization, aclMiddleware([ROLES.PENGURUS])], financeController.delete);

router.get("/finances/reports/monthly", authMiddleware.authorization, financeReportController.monthly);

router.get("/statistics", authMiddleware.authorization, statisticsController.getStatistics);

export default router;