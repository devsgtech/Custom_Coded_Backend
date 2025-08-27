const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const contactRoutes = require("./routes/contactRoutes");
const faqRoutes = require("./routes/faqRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const metaRoutes = require("./routes/metaRoutes");
const codeidRoutes = require("./routes/codeIDRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const accountRoutes = require("./routes/accountRoutes");
const { rateLimit } = require("express-rate-limit");

const pool = require("./config/database");

dotenv.config();

const app = express();
const PORT = process.env.SERVER_PORT || 5000;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  ipv6Subnet: 56, // Set to 60 or 64 to be less aggressive, or 52 or 48 to be more aggressive
});

app.use(limiter);

app.use(cors());
app.use(bodyParser.json());

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`, {
    body: req.body,
    headers: req.headers,
  });
  next();
});

// Routes
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/account", limiter, accountRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/faq", faqRoutes);
app.use("/api/categoty", categoryRoutes);
app.use("/api/meta", metaRoutes);
app.use("/api/codeid", codeidRoutes);
app.use("/api/upload", uploadRoutes);

app.use("/public", express.static(path.join(__dirname, "..", "public")));

app.use("/templates", express.static("public/templates"));
app.use("/template", express.static("public/template"));
app.use("/fonts", express.static("public/fonts"));
app.use("/background", express.static("public/background"));
app.use("/overlay", express.static("public/overlay"));
app.use("/finalvideo_2", express.static("public/finalvideo_2"));
app.use("/videos", express.static("public/videos"));
app.use("/videos/attachements", express.static("public/videos/attachements"));

// Multer error handling middleware (must come before generic error handler)
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error("Multer error:", err);

    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(422).json({
        status: false,
        statusCode: 422,
        message: "File size too large. Maximum size is 100MB.",
        errors: null,
        timestamp: new Date().toISOString(),
      })
    }

    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(422).json({
        status: false,
        statusCode: 422,
        message: "Too many files uploaded.",
        errors: null,
        timestamp: new Date().toISOString(),
      });
    }

    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(422).json({
        status: false,
        statusCode: 422,
        message: "Unexpected file field.",
        errors: null,
        timestamp: new Date().toISOString(),
      });
    }

    return res.status(422).json({
      status: false,
      statusCode: 422,
      message: err.message || "File upload error",
      errors: null,
      timestamp: new Date().toISOString(),
    });
  }

  // Handle file filter errors
  if (err.message && err.message.includes("Only video files are allowed")) {
    return res.status(422).json({
      status: false,
      statusCode: 422,
      message:
        "Invalid file type. Only video files (mp4, mov, avi, wmv, flv, mkv) are allowed.",
      errors: null,
      timestamp: new Date().toISOString(),
    });
  }

  next(err);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: "error",
    message: "Something went wrong!",
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
