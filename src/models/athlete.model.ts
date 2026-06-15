import mongoose from "mongoose";
import { BELT } from "../utils/contants";

const AthleteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    birthdate: { type: Date, required: true },
    schools: [
      { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true }
    ],
    imageUrl: { type: String, default: "" },
    belt: {
      type: String,
      enum: [BELT.PUTIH, BELT.KUNING, BELT.HIJAU, BELT.BIRU, BELT.COKLAT, BELT.HITAM],
      required: true,
      default: BELT.PUTIH,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Athlete", AthleteSchema);