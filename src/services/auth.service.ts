import UserModel from "../models/user.model";
import CoachModel from "../models/coach.model";
import { ITokenPayload } from "../utils/interfaces";
import { verifyPassword } from "../utils/password";
import { TChangePassword, TLogin, TRegister } from "../validators/auth.validate";
import { TCoachLogin } from "../validators/coach.validate";
import createHttpError from "http-errors";
import crypto from "crypto";
import { hashPassword } from "../utils/password";
import { generateAuthTokens } from "../utils/jwt";
import { ROLES } from "../utils/contants";

async function loginService(userData: TLogin) {
  const { username, password } = userData;

  // 1. Coba cari di UserModel (untuk Staff/Pengurus)
  const user = await UserModel.findOne({
    username,
  }).select("+password");

  if (user && (await verifyPassword(password, user.password))) {
    if (user.isActive === false) {
      throw new createHttpError.Forbidden("Akun Anda telah dinonaktifkan. Silahkan hubungi administrator.");
    }

    const payload: ITokenPayload = {
      _id: user._id.toString(),
      role: user.role,
    };
    const token = generateAuthTokens(payload);

    await user.save();

    const userObj = user.toObject();
    const { password: _, resetPasswordToken: ____, resetPasswordExpires: _____, __v, ...userWithoutSensitiveData } = userObj;
    return {
      user: userWithoutSensitiveData,
      ...token,
    };
  }

  // 2. Jika tidak ditemukan atau password tidak cocok, coba cari di CoachModel (untuk Pelatih)
  const coach = await CoachModel.findOne({
    name: { $regex: new RegExp(`^${username}$`, "i") },
  }).select("+password");

  if (coach && (await verifyPassword(password, coach.password))) {
    const payload: ITokenPayload = {
      _id: coach._id.toString(),
      role: ROLES.PELATIH,
    };
    const token = generateAuthTokens(payload);

    const coachObj = coach.toObject();
    const { password: _, __v, ...coachWithoutSensitiveData } = coachObj;
    return {
      user: {
        ...coachWithoutSensitiveData,
        role: ROLES.PELATIH,
      },
      ...token,
    };
  }

  // 3. Jika keduanya gagal, throw error
  throw new createHttpError.Unauthorized("Username/Nama atau password salah");
}

async function coachLoginService(loginData: TCoachLogin) {
  const { name, password } = loginData;

  const coach = await CoachModel.findOne({
    name: { $regex: new RegExp(`^${name}$`, "i") },
  }).select("+password");



  if (!coach || !(await verifyPassword(password, coach.password))) {
    throw new createHttpError.Unauthorized("Nama atau password salah");
  }

  const payload: ITokenPayload = {
    _id: coach._id.toString(),
    role: ROLES.PELATIH,
  };
  const token = generateAuthTokens(payload);

  const coachObj = coach.toObject();
  const { password: _, __v, ...coachWithoutSensitiveData } = coachObj;
  return {
    user: coachWithoutSensitiveData,
    ...token,
  };
}

async function logoutService(userId: string) {
  const user = await UserModel.findById(userId);
  if (!user) return;

  await UserModel.updateOne(
    { _id: userId },
    {
      $set: {
        accessToken: {
          token: "",
        },
      },
    },
  );
}

async function registerService(registerData: TRegister) {
  const { username, password } = registerData as any;

  const existingUser = await UserModel.findOne({ username });
  if (existingUser) {
    throw new Error("Username sudah terdaftar");
  }

  const user = new UserModel({ username, password });
  await user.save();

  const userObj = user.toObject();
  const { password: _, __v, ...userWithoutSensitiveData } = userObj;
  return userWithoutSensitiveData;
}

async function updateProfileService(userId: string, profileData: Partial<{ name: string; email: string; username: string }>) {
  const { name, email, username } = profileData;

  const user = await UserModel.findById(userId);
  if (!user) {
    throw new createHttpError.NotFound("User not found");
  }

  if (username && username !== user.username) {
    const existingUsername = await UserModel.findOne({ username });
    if (existingUsername) throw createHttpError(400, "Username sudah digunakan");
    user.username = username;
  }

  if (email && email !== user.email) {
    if (user.role !== "pengurus") throw createHttpError(403, "Hanya Admin yang bisa memiliki email");
    const existingEmail = await UserModel.findOne({ email });
    if (existingEmail) throw createHttpError(400, "Email sudah digunakan");
    user.email = email;
  }

  if (name) user.username = name;

  return await user.save();
}

async function changePasswordService(userId: string, passwordData: TChangePassword) {
  const { oldPassword, newPassword } = passwordData;

  const user = await UserModel.findById(userId).select("+password");
  if (!user) {
    throw new createHttpError.NotFound("User not found");
  }

  const isOldPasswordValid = await verifyPassword(oldPassword, user.password);
  if (!isOldPasswordValid) {
    throw new createHttpError.Unauthorized("Old password is incorrect");
  }

  user.password = newPassword;
    
  await user.save();
}

// // async function forgotPasswordRequest(email: string) {
//   const user = await UserModel.findOne({ email, role: "admin" });

//   if (!user) {
//     throw createHttpError(404, "Akun Admin dengan email tersebut tidak ditemukan.");
//   }

//   if (user.resetPasswordExpires && user.resetPasswordExpires > new Date(Date.now() - 60000)) {
//     throw createHttpError(429, "Tunggu 1 menit sebelum request ulang.");
//   }

//   const resetToken = crypto.randomBytes(32).toString("hex");

//   user.resetPasswordToken = resetToken;
//   user.resetPasswordExpires = new Date(Date.now() + 3600000);

//   await user.save();

//   await sendForgotPasswordEmail(user.email!, user.username, resetToken);
// } 

async function resetPassword(token: string, newPassword: string) {
  const user = await UserModel.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: new Date() },
  });

  if (!user) {
    throw createHttpError(400, "Token reset password tidak valid atau telah kedaluwarsa.");
  }

  user.password = await hashPassword(newPassword);

  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();
}

export default { changePasswordService, coachLoginService, loginService, logoutService, resetPassword, updateProfileService, registerService };



