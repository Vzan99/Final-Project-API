import multer, { FileFilterCallback, MulterError } from "multer";

export function Multer() {
  return multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 1024 * 1024,
    },
    fileFilter(
      req: Express.Request,
      file: Express.Multer.File,
      cb: FileFilterCallback
    ) {
      if (file.fieldname === "photo") {
        const allowed = ["image/jpeg", "image/png"];
        if (!allowed.includes(file.mimetype)) {
          return cb(new MulterError("LIMIT_UNEXPECTED_FILE", "photo"));
        }
        return cb(null, true);
      }

      if (file.fieldname === "resume") {
        const allowedDocs = [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ];
        if (!allowedDocs.includes(file.mimetype)) {
          return cb(new MulterError("LIMIT_UNEXPECTED_FILE", "resume"));
        }
        return cb(null, true);
      }

      return cb(new MulterError("LIMIT_UNEXPECTED_FILE", file.fieldname));
    },
  });
}
