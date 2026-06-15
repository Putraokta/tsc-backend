import mongoose, { Query } from "mongoose";
import { IUser } from "../utils/interfaces";
import { hashPassword, verifyPassword } from "../utils/password";
import { ROLES } from "../utils/contants";

const UserSchema = new mongoose.Schema<IUser>({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        minlength: 3
    },
    email: {
        type: String,
        required: false,
        unique: false,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    role: {
        type: String,
        enum: [ROLES.PENGURUS, ROLES.PELATIH],
        required: true,
        default: ROLES.PELATIH,
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

UserSchema.pre("save", async function () {
    const user = this;
    if (!user.isModified("password")) {
        return;
    }

    user.password = await hashPassword(user.password);
});

UserSchema.pre<Query<IUser, IUser>>('findOneAndUpdate', async function () {
    const update = this.getUpdate() as { password?: string };

    if (!update.password) {
        return;
    }

    try {
        update.password = await hashPassword(update.password);
    } catch (error) {
        throw new Error('Failed to hash password');
    }
});

UserSchema.methods.comparePassword = function (passwordInput: string): Promise<boolean> {
    return verifyPassword(passwordInput, this.password);
};


UserSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password;
    delete user.__v;
    return user;
};

const UserModel = mongoose.model<IUser>('User', UserSchema);

export default UserModel; 
