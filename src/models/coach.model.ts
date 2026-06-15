import mongoose from "mongoose";
import { hashPassword } from "../utils/password";

interface ICoach {
    user: mongoose.Types.ObjectId;
    name: string;
    birthdate: Date;
    password: string;
    schools: mongoose.Types.ObjectId[];
    createdAt?: Date;
    updatedAt?: Date;
}

export const CoachSchema = new mongoose.Schema<ICoach>({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    name: {
        type: String,
        required: true,
    },

    birthdate: {
        type: Date,
        required: true
    },

    password: {
        type: String,
        required: true,
        select: false,
    },

    schools: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "School",
        required: true,
    }],

    
},

    {
        timestamps: true
    });

    CoachSchema.pre("save", async function () {
        const coach = this;
        if (!coach.isModified("password")) {
            return;
        }
    
        coach.password = await hashPassword(coach.password);
    });

    CoachSchema.index({ createdAt: 1 });

    CoachSchema.methods.toJSON = function () {
        const coach = this.toObject();
        delete coach.password;
        delete coach.__v;
        return coach;
    };

const CoachModel = mongoose.model<ICoach>("Coach", CoachSchema);

export default CoachModel;
