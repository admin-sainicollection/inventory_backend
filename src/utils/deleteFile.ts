import fs from "fs";
import path from "path";

export const deleteFile = (filePath?: string | null) => {
  if (!filePath) return;

  // 🔥 FIX: remove leading slash if exists
  const cleanPath = filePath.startsWith("/")
    ? filePath.slice(1)
    : filePath;

  // 🔥 absolute path बनाओ
  const absolutePath = path.join(process.cwd(), cleanPath);

  if (fs.existsSync(absolutePath)) {
    fs.unlinkSync(absolutePath);
    console.log("🗑️ Deleted:", absolutePath);
  } else {
    console.log("❌ Not found:", absolutePath);
  }
};