require("dotenv").config();
const express = require("express");
const mysql = require("mysql");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const path = require("path");

const app = express();

// Configure middleware
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 3600000 }, // 1 hour
  })
);

// MySQL connection setup
const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PW,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

// Check MySQL connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error("Database connection failed: " + err.stack);
    return;
  }
  console.log("Connected to MySQL database");
  connection.release();
});

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
  console.log("Checking authentication for session: ", req.session); // Debugging line
  if (req.session.user) {
    console.log("User is authenticated: ", req.session.user); // Debugging line
    return next(); // Proceed to the next middleware or route handler
  }
  console.log("User not authenticated, redirecting to /signin"); // Debugging line
  res.redirect("/signin"); // Redirect to signin if not authenticated
}

// Index route
app.get("/", (req, res) => {
  console.log("Index route, session: ", req.session); // Debugging line
  if (req.session.user) {
    return res.redirect("/home"); // Redirect to home if authenticated
  }
  res.redirect("/signup"); // Redirect to signup if not authenticated
});

// Signup page
app.get("/signup", (req, res) => {
  res.render("signup"); // Ensure you have signup.ejs in your views directory
});

// Signup form submission
app.post("/signup", async (req, res) => {
  const { username, password, email } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  // Check if username or email already exists
  pool.query(
    "SELECT * FROM users WHERE username = ? OR email = ?",
    [username, email],
    (err, results) => {
      if (err) {
        console.error("Error checking existing user:", err);
        return res.status(500).render("error");
      }

      if (results.length > 0) {
        return res.render("signup", { error: "Username or email already exists." });
      } else {
        pool.query(
          "INSERT INTO users (username, password, email) VALUES (?, ?, ?)",
          [username, hashedPassword, email],
          (err, result) => {
            if (err) {
              console.error("Error inserting new user:", err);
              return res.status(500).render("error");
            }
            // After successful signup, redirect to signin
            res.redirect("/signin");
          }
        );
      }
    }
  );
});

// Signin page
app.get("/signin", (req, res) => {
  res.render("signin"); // Ensure you have signin.ejs in your views directory
});

// Signin form submission
app.post("/signin", async (req, res) => {
  const { username, password } = req.body;

  // Fetch user from database
  pool.query(
    "SELECT * FROM users WHERE username = ?",
    [username],
    async (err, results) => {
      if (err) {
        console.error("Error fetching user:", err);
        return res.status(500).render("error");
      }

      if (results.length === 0) {
        return res.render("signin", { error: "Incorrect username." });
      }

      const user = results[0];
      // Validate password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.render("signin", { error: "Incorrect password." });
      }

      req.session.user = user;
      req.session.save((err) => {
        if (err) {
          console.error("Error saving session:", err);
          return res.status(500).render("error");
        }
        console.log("Session set: ", req.session.user); // Debugging line
        res.redirect("/home");
      });
    }
  );
});

// Home page (authenticated)
app.get("/home", isAuthenticated, (req, res) => {
  console.log("Home route, user in session: ", req.session.user); // Debugging line
  res.render("home", { user: req.session.user });
});

// Logout
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
    }
    res.redirect("/signin"); // Redirect to signin after logout
  });
});

// All content page (authenticated)
app.get("/all-content", isAuthenticated, (req, res) => {
  pool.query("SELECT * FROM resources", (err, results) => {
    if (err) {
      console.error("Error fetching resources:", err);
      return res.status(500).render("error");
    }
    res.render("all-content", { resources: results });
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

