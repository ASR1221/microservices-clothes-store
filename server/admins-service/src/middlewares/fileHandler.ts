import { Request } from "express";
import fs from "fs";

import multer, { FileFilterCallback } from "multer";

const storage = multer.diskStorage({
   destination: (req, file, cb) => {
      const destination = "G:\\personal_learning\\webProjects\\microservices-clothes-store\\server\\items-service\\public\\images\\items";
      fs.access(destination, (err) => {
         if (err) {
            // Handle the error, e.g., create the directory
            fs.mkdirSync(destination, { recursive: true });
         }
         cb(null, destination);
      });
   },
   filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${Math.round(Math.random() * 10000)}-${file.originalname}`);
   }
});

function fileFilter(req: Request, file: Express.Multer.File, cb: FileFilterCallback) {
   if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
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