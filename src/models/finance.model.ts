import mongoose from "mongoose";
import { FINANCE_TYPE } from "../utils/contants";

export const FinanceSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    type: {
        type: String,
        enum: [FINANCE_TYPE.INCOME, FINANCE_TYPE.EXPENSE],
        required: true
    },

    balance: {
        type: Number,
        required: true,
        min: 0
    },
    
    description: {
        type: String,
        default: ""
    },

    date: {
        type: Date,
        default: Date.now
    },
},

    {
        timestamps: true
    });

FinanceSchema.index({ createdAt: 1 });

const FinanceModel = mongoose.model("Finance", FinanceSchema);

export default FinanceModel;
