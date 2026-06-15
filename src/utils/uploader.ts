import ImageKit from "imagekit";
import { env } from "./env";
import { Express } from "express";
import { Multer } from "multer";

const imagekit = new ImageKit({
  publicKey: env.IMAGEKIT_PUBLIC_KEY,
  privateKey: env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: env.IMAGEKIT_URL_ENDPOINT,
});

const imageKitUtil = {
  async uploadSingle(file: Express.Multer.File, folder = "general") {
    try {	
      const fileName = `${Date.now()}-${file.originalname}`;
	const fullFolder = `tsc/${folder}`;

      const result = await imagekit.upload({
        file: file.buffer,
        fileName: fileName,
        folder: fullFolder,
      });
      return { url: result.url, fileId: result.fileId };
    } catch (error) {
      throw error;
    }
  },

  async uploadMultiple(files: Express.Multer.File[], folder= "general") {
    const uploadPromises = files.map((file) => {
      return imageKitUtil.uploadSingle(file, folder);
    });
    const results = await Promise.all(uploadPromises);
    return results;
  },

  async removeFile(fileId: string) {
    try {
      const result = await imagekit.deleteFile(fileId);
      return result;
    } catch (error) {
      throw error;
    }
  },
};

export default imageKitUtil;