import multer from "multer";
import path from "path";
import fs from "fs";

const storage = multer.diskStorage({
  destination: (req: any, file, cb) => {
    const folder = req.body.folder || "common"; // dynamic folder

    const uploadPath = path.join(process.cwd(), "uploads", folder);

    // create folder if not exists
    fs.mkdirSync(uploadPath, { recursive: true });

    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    const cleanName = file.originalname
      .replace(/\s+/g, "_")     // space हटाओ
      .replace(/[^\w.-]/g, ""); // weird chars हटाओ

    const uniqueName = Date.now() + "-" + cleanName;

    cb(null, uniqueName);
  }
});

export const upload = multer({ storage });