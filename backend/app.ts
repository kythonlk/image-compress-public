import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import cors from 'cors';

const app = express();

interface ProcessedFile {
  originalName: string;
  renamedName?: string;
  url?: string;
  status: 'success' | 'error';
  error?: string;
}

app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (_req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage: storage });

app.use('/uploads', express.static('uploads'));

const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

app.post("/upload", upload.array("files"), asyncHandler(async (req: Request, res: Response) => {
  if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
    return res.status(400).json({
      message: "No files uploaded",
      files: []
    });
  }

  const prefix = (req.body.prefix as string) || "images";

  const processedFiles: ProcessedFile[] = await Promise.all(
    req.files.map(async (file, index) => {
      const newFileName = `${prefix}${index + 1}.webp`;
      const outputFilePath = path.join(uploadsDir, newFileName);

      try {
        await sharp(file.path)
          .resize(800)
          .webp({ quality: 90 })
          .toFile(outputFilePath);

        fs.unlinkSync(file.path);

        return {
          originalName: file.originalname,
          renamedName: newFileName,
          url: `/uploads/${newFileName}`,
          status: 'success'
        };
      } catch (err) {
        console.error("Error processing file:", file.originalname, err);
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
        return {
          originalName: file.originalname,
          status: 'error',
          error: err instanceof Error ? err.message : 'Unknown error occurred'
        };
      }
    })
  );

  res.json({
    message: "Files processed and renamed successfully",
    files: processedFiles
  });
}));

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
