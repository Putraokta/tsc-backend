import mongoose from "mongoose";

export const MediaSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["sertifikat", "latihan"],
    },
    url: {
      type: String,
      required: true,
    },
    fileId: {
      type: String,
      required: true,
    },
    athlete: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Athlete",
      required: false,
      default: null,
    },
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: false,
      default: null,
    },
    uploader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const MediaModel = mongoose.model("Media", MediaSchema);

export default MediaModel;
