import fs from "fs";
import path from "path";
import { APP_ENV } from "./env";

const BASE_UPLOAD_PATH =
  APP_ENV === "production"
    ? "/home/u319537805/uploads"
    : path.join(process.cwd(), "uploads");

// This function saves an image buffer to your local computer
export const saveImageLocally = async (
  buffer: Buffer,           // The image data
  folder: string,          // Where to save (e.g., "cars/baseImages")
  originalName: string     // Original file name
): Promise<string> => {
  // const uploadPath = path.join(process.cwd(), "uploads", folder);
  const uploadPath = path.join(BASE_UPLOAD_PATH, folder);
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  const timestamp = Date.now();
  const cleanName = originalName.replace(/\s+/g, "_").replace(/[^\w.-]/g, "");
  const fileName = `${timestamp}-${cleanName}`;
  const fullPath = path.join(uploadPath, fileName);

  // console.log("Saving image to:", fullPath);
  // console.log("Folder exists:", fs.existsSync(uploadPath));

  fs.writeFileSync(fullPath, buffer);

  return `/uploads/${folder}/${fileName}`;
};