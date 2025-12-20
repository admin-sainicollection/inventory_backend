
import multer from "multer";

const storage = multer.memoryStorage();
export const upload = multer({
    storage, limits: {
        fileSize: 10 * 1024 * 1024, // 10MB per file
        fieldSize: 50 * 1024 * 1024, // 50MB for fields
    }
});
