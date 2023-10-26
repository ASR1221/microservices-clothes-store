import { Request } from "express";

import multer, { FileFilterCallback } from "multer";

const storage = multer.diskStorage({
   destination: (req, file, cb) => {
      cb(null, "../../../items-service/public/images/items");
   },
   filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
   }
});

function fileFilter(req: Request, file: Express.Multer.File, cb: FileFilterCallback) {
   if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG and PNG images are allowed'));
    }
}

const upload = multer({
   storage,
   fileFilter,
   limits: { fileSize: 3_000_000 }, // Only files under 3MB are allowed
})
   .fields([
      { name: "images", maxCount: 3 },
      { name: "json", maxCount: 1},
   ]);

export default upload;