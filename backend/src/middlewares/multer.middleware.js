import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, "./public/temp");
    },
    filename: function(req, file, cb) {
        const ext = path.extname(file.originalname);
        const sanitizedBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, "");
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${sanitizedBase || "file"}-${uniqueSuffix}${ext}`);
    }
});

export const upload = multer({
    storage,
    limits: {
        fileSize: 100 * 1024 * 1024 // 100 MB max limit
    }
});