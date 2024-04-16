const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname),
    );
  },
});

const upload = multer({ storage: storage });

app.post("/upload", upload.single("file"), (req, res) => {
  const filepath = req.file.path;
  const outputFilename = req.file.filename.replace(
    path.extname(req.file.filename),
    ".webp",
  );
  const outputFilePath = path.join("uploads", outputFilename);

  sharp(filepath)
    .resize(800) // Optional: resize to a max width of 800px, keeping aspect ratio
    .webp({ quality: 90 }) // Convert to WebP with specified quality
    .toFile(outputFilePath, (err) => {
      if (err) {
        console.error("Error during image processing:", err);
        return res.status(500).json({ error: "Error during image processing" });
      }

      fs.unlink(filepath, (unlinkErr) => {
        if (unlinkErr) {
          console.warn("Error deleting original file:", unlinkErr);
        }
        res.json({
          message: "Image uploaded and converted to WebP successfully",
          url: `/uploads/${outputFilename}`,
        });
      });
    });
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
