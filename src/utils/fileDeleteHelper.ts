import fs from "fs";
import path from "path";

export const deleteLocalImage = (imagePath: string) => {
    if (!imagePath) return;

    // Remove leading slash if exists
    const cleanPath = imagePath.startsWith("/") ? imagePath.slice(1) : imagePath;
    const absolutePath = path.join(process.cwd(), cleanPath);

    if (fs.existsSync(absolutePath)) {
        fs.unlinkSync(absolutePath);
    }
};

export const deleteMultipleImages = (imagePaths: string[]) => {
    for (const imagePath of imagePaths) {
        deleteLocalImage(imagePath);
    }
};