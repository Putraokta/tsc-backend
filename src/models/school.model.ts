import mongoose from "mongoose";

export const SchoolSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },

    address: {
        type: String,
        required: true,
    },

    isActive: {
        type: Boolean,
        default: true
    }
},

    {
        timestamps: true
    });

const SchoolModel = mongoose.model("School", SchoolSchema);

export default SchoolModel;