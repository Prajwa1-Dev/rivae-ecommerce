require("dotenv").config();

const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const helmet = require("helmet");
const compression = require("compression");
const expressLayouts = require("express-ejs-layouts");
const flash = require("connect-flash");

// ----------------------
// ROUTES
// ----------------------
const indexRouter = require("./routes/index");
const authRouter = require("./routes/auth.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const usersRouter = require("./routes/users");
const productRouter = require("./routes/products");
const cartRouter = require("./routes/cart");
const checkoutRouter = require("./routes/checkout");
const adminRouter = require("./routes/admin");
const orderRoutes = require("./routes/orderRoutes");
const locationRoutes = require("./routes/location");
const orderPageRoutes = require("./routes/orders.page.routes");
const adminOrderRoutes = require("./routes/admin/orders.routes");
const paymentRoutes = require("./routes/payment.routes");
const invoiceRoutes = require("./routes/invoice.routes");
const contactRoutes = require("./routes/contact.routes");

// ----------------------
// INITIALIZE APP
// ----------------------
const app = express();
app.set("trust proxy", 1); // Required for Render

// ----------------------
// CONNECT MONGODB (Production Safe)
// ----------------------
mongoose
  .connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.error("❌ MongoDB Error:", err);
    process.exit(1);
  });

// ----------------------
// VIEW ENGINE
// ----------------------
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(expressLayouts);
app.set("layout", "layout");

// ----------------------
// SECURITY
// ----------------------
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],

        scriptSrc: [
          "'self'",
          "https://ipapi.co",
          "https://nominatim.openstreetmap.org",
        ],

        connectSrc: [
          "'self'",
          "https://ipapi.co",
          "https://nominatim.openstreetmap.org",
        ],

        imgSrc: [
          "'self'",
          "data:",
          "https://res.cloudinary.com",
        ],

        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://fonts.googleapis.com",
        ],

        fontSrc: [
          "'self'",
          "https://fonts.gstatic.com",
        ],
      },
    },
  })
);

// Compression (Performance)
app.use(compression());

// ----------------------
// MIDDLEWARE
// ----------------------
if (process.env.NODE_ENV !== "production") {
  app.use(logger("dev"));
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// ----------------------
// SESSION (Production Safe)
// ----------------------
app.use(
  session({
    name: "rivae.sid",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: "sessions",
      ttl: 24 * 60 * 60,
    }),
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

// ----------------------
// FLASH
// ----------------------
app.use(flash());

// ----------------------
// GLOBAL LOCALS
// ----------------------
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");

  res.locals.currentUser = req.session.userId || null;
  res.locals.currentRole = req.session.role || "user";

  res.locals.pageTitle = "";
  res.locals.isAdminPage = false;
  res.locals.isAuthPage = false;
  res.locals.hideChrome = false;

  next();
});

// ----------------------
// ROUTES
// ----------------------
app.use("/", indexRouter);
app.use("/", authRouter);
app.use("/", dashboardRoutes);

app.use("/users", usersRouter);
app.use("/products", productRouter);
app.use("/cart", cartRouter);
app.use("/checkout", checkoutRouter);
app.use("/api/location", locationRoutes);
app.use("/", orderPageRoutes);
app.use("/", invoiceRoutes);
app.use("/", contactRoutes);

app.use("/api/orders", orderRoutes);

app.use("/admin/orders", adminOrderRoutes);
app.use("/admin", adminRouter);

app.use("/payment", paymentRoutes);

// ----------------------
// 404
// ----------------------
app.use((req, res, next) => {
  next(createError(404));
});

// ----------------------
// ERROR HANDLER
// ----------------------
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error =
    process.env.NODE_ENV === "production" ? {} : err;

  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
