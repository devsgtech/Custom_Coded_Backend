const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const contactRoutes = require("./routes/contactRoutes");
const faqRoutes = require("./routes/faqRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const pool = require("./config/database");

dotenv.config();

const app = express();
const PORT = process.env.SERVER_PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// Add request logging middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`, {
        body: req.body,
        headers: req.headers
    });
    next();
});

// Routes
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/faq", faqRoutes);
app.use("/api/categoty", categoryRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        status: 'error',
        message: 'Something went wrong!'
    });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
