const crypto = require("crypto");
const fs = require("fs/promises");
const path = require("path");
const multer = require("multer");

// Uploaded images are saved in src/assets/<folder>/ and index.js serves that
// folder at ASSETS_URL. The URL starts with /api so the client's dev proxy
// forwards image requests to the backend too.
const ASSETS_DIR = path.join(__dirname, "..", "assets/upload");
const ASSETS_URL = "/api/v1/assets";
const MAX_IMAGE_MB = 5;

// The file type is read from the file's first bytes, not from its name or the
// Content-Type the client sends, because both of those can be faked.
const IMAGE_TYPES = [
  {
    ext: ".jpg",
    matches: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  },
  {
    ext: ".png",
    matches: (b) => b.toString("latin1", 0, 8) === "\x89PNG\r\n\x1a\n",
  },
  { ext: ".gif", matches: (b) => b.toString("latin1", 0, 4) === "GIF8" },
  {
    ext: ".webp",
    matches: (b) =>
      b.toString("latin1", 0, 4) === "RIFF" &&
      b.toString("latin1", 8, 12) === "WEBP",
  },
];

const detectImageExt = (buffer) =>
  IMAGE_TYPES.find(({ matches }) => matches(buffer))?.ext ?? null;

// The file is kept in memory and only written to disk by saveImage, after the
// controller has checked that the brand or product exists.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_MB * 1024 * 1024, files: 1 },
}).single("image");

const UPLOAD_ERRORS = {
  LIMIT_FILE_SIZE: `image must be at most ${MAX_IMAGE_MB} MB`,
  LIMIT_FILE_COUNT: 'send only one file, in the "image" field',
  LIMIT_UNEXPECTED_FILE: 'send only one file, in the "image" field',
};

// Route middleware: reads one file from the "image" form field into req.file.
// Upload errors are sent as { message } instead of Express's HTML error page.
const receiveImage = (req, res, next) => {
  upload(req, res, (error) => {
    if (!error) return next();
    const message =
      UPLOAD_ERRORS[error.code] ?? "the uploaded form could not be read";
    res.status(400).json({ message });
  });
};

const validateImage = (file) => {
  if (!file) {
    return 'image is required: send it as multipart/form-data in the "image" field';
  }
  if (!detectImageExt(file.buffer)) {
    return "image must be a JPEG, PNG, GIF or WebP file";
  }
  return null;
};

// Writes the file to src/assets/<folder>/ under a new random name and returns
// its public path, e.g. /api/v1/assets/brand/1759650000000-3f9a1c2b.png
const saveImage = async (folder, file) => {
  const random = crypto.randomBytes(4).toString("hex");
  const fileName = `${Date.now()}-${random}${detectImageExt(file.buffer)}`;
  const folderPath = path.join(ASSETS_DIR, folder);
  await fs.mkdir(folderPath, { recursive: true });
  await fs.writeFile(path.join(folderPath, fileName), file.buffer);
  return `${ASSETS_URL}/${folder}/${fileName}`;
};

// Deletes a file saved by saveImage. Paths outside src/assets are ignored, and
// a failed delete is only logged: the database change has already been made.
const deleteImage = async (publicPath) => {
  if (
    typeof publicPath !== "string" ||
    !publicPath.startsWith(`${ASSETS_URL}/`)
  ) {
    return;
  }
  const filePath = path.join(ASSETS_DIR, publicPath.slice(ASSETS_URL.length));
  if (!filePath.startsWith(ASSETS_DIR + path.sep)) return;
  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error.code !== "ENOENT") console.error(error);
  }
};

module.exports = {
  ASSETS_DIR,
  ASSETS_URL,
  receiveImage,
  validateImage,
  saveImage,
  deleteImage,
};
