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
        return res.status(500).render("error", { message: "Error checking existing user." });
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
              return res.status(500).render("error", { message: "Error inserting new user." });
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
        return res.status(500).render("error", { message: "Error fetching user." });
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
          return res.status(500).render("error", { message: "Error saving session." });
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

// all content
app.get('/all-content', async (req, res) => {
  const { category, resource_type, search, sort } = req.query;

  console.log('Selected Category:', category); // Debugging line
  console.log('Selected Resource Type:', resource_type); // Debugging line
  console.log('Search Keyword:', search); // Debugging line
  console.log('Sort Order:', sort); // Debugging line

  let query = `
    SELECT resources.*, categories.name AS category_name, resource_types.name AS resource_type_name 
    FROM resources 
    LEFT JOIN categories ON resources.category_id = categories.id
    LEFT JOIN resource_types ON resources.resource_type_id = resource_types.id
    WHERE 1=1
  `;
  let queryParams = [];

  if (category) {
    query += ' AND category_id = ?';
    queryParams.push(category);
  }

  if (resource_type) {
    query += ' AND resource_type_id = ?';
    queryParams.push(resource_type);
  }

  if (search) {
    query += ' AND resources.name LIKE ?';
    queryParams.push('%' + search + '%');
  }

  if (sort) {
    if (sort === 'asc') {
      query += ' ORDER BY resources.name ASC';
    } else if (sort === 'desc') {
      query += ' ORDER BY resources.name DESC';
    }
  }

  console.log('Query:', query);
  console.log('Query Params:', queryParams);

  try {
    const resources = await new Promise((resolve, reject) => {
      pool.query(query, queryParams, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    const categories = await new Promise((resolve, reject) => {
      pool.query('SELECT * FROM categories', (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    const resourceTypes = await new Promise((resolve, reject) => {
      pool.query('SELECT * FROM resource_types', (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    console.log('Resources:', resources);
    console.log('Categories:', categories);
    console.log('Resource Types:', resourceTypes);

    res.render('all-content', {
      resources,
      categories: Array.isArray(categories) ? categories : [],
      resourceTypes: Array.isArray(resourceTypes) ? resourceTypes : [],
      selectedCategory: category || '',
      selectedResourceType: resource_type || '',
      search: search || '',
      sort: sort || ''
    });
  } catch (error) {
    console.error('Error retrieving resources:', error);
    res.status(500).render('error', { message: 'Error retrieving resources.' });
  }
});

// View all learnlists of a user
app.get('/learnlists', isAuthenticated, (req, res) => {
  const userId = req.session.user.id;
  pool.query(
    `SELECT ul.*, COALESCE(AVG(r.rating), 0) AS average_rating
     FROM user_learnlists ul
     LEFT JOIN reviews r ON ul.id = r.learnlist_id
     WHERE ul.user_id = ?
     GROUP BY ul.id`,
    [userId],
    (err, userLearnlists) => {
      if (err) {
        console.error('Error retrieving learnlists:', err);
        return res.status(500).render('error', { message: 'Error retrieving learnlists.' });
      }

      pool.query(
        `SELECT ul.*, u.username, COALESCE(AVG(r.rating), 0) AS average_rating
         FROM user_learnlists ul
         LEFT JOIN users u ON ul.user_id = u.id
         LEFT JOIN reviews r ON ul.id = r.learnlist_id
         GROUP BY ul.id`,
        (err, allLearnlists) => {
          if (err) {
            console.error('Error retrieving all learnlists:', err);
            return res.status(500).render('error', { message: 'Error retrieving all learnlists.' });
          }
          res.render('learnlists', { userLearnlists, allLearnlists, currentUser: req.session.user });
        }
      );
    }
  );
});

// View form to create a new learnlist
app.get('/learnlists/new', isAuthenticated, async (req, res) => {
  try {
    const resources = await new Promise((resolve, reject) => {
      pool.query('SELECT * FROM resources', (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
    res.render('new-learnlist', { resources });
  } catch (err) {
    console.error('Error retrieving resources:', err);
    res.status(500).render('error', { message: 'Error retrieving resources.' });
  }
});

// Handle form submission to create a new learnlist
app.post('/learnlists', isAuthenticated, (req, res) => {
  const { name, description, resources } = req.body;
  const userId = req.session.user.id;
  pool.query(
    'INSERT INTO user_learnlists (user_id, name, description) VALUES (?, ?, ?)',
    [userId, name, description],
    (err, result) => {
      if (err) {
        console.error('Error creating learnlist:', err);
        return res.status(500).render('error', { message: 'Error creating learnlist.' });
      }
      const learnlistId = result.insertId;
      if (resources) {
        const resourceIds = Array.isArray(resources) ? resources : [resources];
        const learnlistResources = resourceIds.map(resourceId => [learnlistId, resourceId]);
        pool.query(
          'INSERT INTO user_learnlist_resources (user_learnlist_id, resource_id) VALUES ?',
          [learnlistResources],
          (err, result) => {
            if (err) {
              console.error('Error adding resources to learnlist:', err);
              return res.status(500).render('error', { message: 'Error adding resources to learnlist.' });
            }
            res.redirect('/learnlists');
          }
        );
      } else {
        res.redirect('/learnlists');
      }
    }
  );
});

// View a specific learnlist with rating form
app.get('/learnlists/:id', isAuthenticated, (req, res) => {
  const learnlistId = req.params.id;

  pool.query(
    'SELECT ul.*, u.username FROM user_learnlists ul LEFT JOIN users u ON ul.user_id = u.id WHERE ul.id = ?',
    [learnlistId],
    (err, learnlistResults) => {
      if (err) {
        console.error('Error retrieving learnlist:', err);
        return res.status(500).render('error', { message: 'Error retrieving learnlist.' });
      }
      if (learnlistResults.length === 0) {
        console.error('Learnlist not found for ID:', learnlistId);
        return res.status(404).render('error', { message: 'Learnlist not found.' });
      }
      const learnlist = learnlistResults[0];
      console.log('Learnlist:', learnlist);

      pool.query(
        'SELECT resources.* FROM resources INNER JOIN user_learnlist_resources ON resources.id = user_learnlist_resources.resource_id WHERE user_learnlist_resources.user_learnlist_id = ?',
        [learnlistId],
        (err, resourceResults) => {
          if (err) {
            console.error('Error retrieving resources:', err);
            return res.status(500).render('error', { message: 'Error retrieving resources.' });
          }
          console.log('Resources:', resourceResults);

          pool.query(
            'SELECT * FROM reviews WHERE learnlist_id = ?',
            [learnlistId],
            (err, reviewResults) => {
              if (err) {
                console.error('Error retrieving reviews:', err);
                return res.status(500).render('error', { message: 'Error retrieving reviews.' });
              }
              console.log('Reviews:', reviewResults);
              
              const reviews = reviewResults || [];
              res.render('learnlist', {
                learnlist,
                resources: resourceResults,
                reviews
              });
            }
          );
        }
      );
    }
  );
});

// View form to edit a learnlist
app.get('/learnlists/:id/edit', isAuthenticated, async (req, res) => {
  const learnlistId = req.params.id;
  try {
    const learnlist = await new Promise((resolve, reject) => {
      pool.query(
        'SELECT * FROM user_learnlists WHERE id = ? AND user_id = ?',
        [learnlistId, req.session.user.id],
        (err, results) => {
          if (err) reject(err);
          else resolve(results[0]);
        }
      );
    });

    const resources = await new Promise((resolve, reject) => {
      pool.query('SELECT * FROM resources', (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    const selectedResources = await new Promise((resolve, reject) => {
      pool.query(
        'SELECT resource_id FROM user_learnlist_resources WHERE user_learnlist_id = ?',
        [learnlistId],
        (err, results) => {
          if (err) reject(err);
          else resolve(results.map(row => row.resource_id));
        }
      );
    });

    res.render('edit-learnlist', { learnlist, resources, selectedResources });
  } catch (err) {
    console.error('Error retrieving learnlist or resources:', err);
    res.status(500).render('error', { message: 'Error retrieving learnlist or resources.' });
  }
});

// Handle form submission to update a learnlist
app.post('/learnlists/:id', isAuthenticated, (req, res) => {
  const learnlistId = req.params.id;
  const { name, description, resources } = req.body;
  pool.query(
    'UPDATE user_learnlists SET name = ?, description = ? WHERE id = ? AND user_id = ?',
    [name, description, learnlistId, req.session.user.id],
    (err, result) => {
      if (err) {
        console.error('Error updating learnlist:', err);
        return res.status(500).render('error', { message: 'Error updating learnlist.' });
      }

      pool.query(
        'DELETE FROM user_learnlist_resources WHERE user_learnlist_id = ?',
        [learnlistId],
        (err, result) => {
          if (err) {
            console.error('Error clearing existing learnlist resources:', err);
            return res.status(500).render('error', { message: 'Error clearing existing learnlist resources.' });
          }

          if (resources) {
            const resourceIds = Array.isArray(resources) ? resources : [resources];
            const learnlistResources = resourceIds.map(resourceId => [learnlistId, resourceId]);
            pool.query(
              'INSERT INTO user_learnlist_resources (user_learnlist_id, resource_id) VALUES ?',
              [learnlistResources],
              (err, result) => {
                if (err) {
                  console.error('Error adding resources to learnlist:', err);
                  return res.status(500).render('error', { message: 'Error adding resources to learnlist.' });
                }
                res.redirect('/learnlists/' + learnlistId);
              }
            );
          } else {
            res.redirect('/learnlists/' + learnlistId);
          }
        }
      );
    }
  );
});

// Handle deletion of a learnlist
app.post('/learnlists/:id/delete', isAuthenticated, (req, res) => {
  const learnlistId = req.params.id;
  pool.query(
    'DELETE FROM user_learnlists WHERE id = ? AND user_id = ?',
    [learnlistId, req.session.user.id],
    (err, result) => {
      if (err) {
        console.error('Error deleting learnlist:', err);
        return res.status(500).render('error', { message: 'Error deleting learnlist.' });
      }
      res.redirect('/learnlists');
    }
  );
});

// Add a review for a learnlist
app.post('/learnlists/:id/reviews', isAuthenticated, (req, res) => {
  const learnlistId = req.params.id;
  const { rating } = req.body;
  const userId = req.session.user.id;

  pool.query(
    'INSERT INTO reviews (user_id, learnlist_id, rating) VALUES (?, ?, ?)',
    [userId, learnlistId, rating],
    (err, result) => {
      if (err) {
        console.error('Error adding rating:', err);
        return res.status(500).render('error', { message: 'Error adding rating.' });
      }
      res.redirect('/learnlists/' + learnlistId);
    }
  );
});

// View all learnlists of all users
app.get('/all-learnlists', isAuthenticated, (req, res) => {
  pool.query(
    `SELECT ul.*, u.username, COALESCE(AVG(r.rating), 0) AS average_rating
     FROM user_learnlists ul
     LEFT JOIN users u ON ul.user_id = u.id
     LEFT JOIN reviews r ON ul.id = r.learnlist_id
     GROUP BY ul.id`,
    (err, results) => {
      if (err) {
        console.error('Error retrieving all learnlists:', err);
        return res.status(500).render('error', { message: 'Error retrieving all learnlists.' });
      }
      res.render('all-learnlists', { allLearnlists: results, currentUser: req.session.user });
    }
  );
});

// View a specific learnlist
app.get('/learnlists/:id', isAuthenticated, (req, res) => {
  const learnlistId = req.params.id;
  pool.query(
    'SELECT ul.*, u.username FROM user_learnlists ul LEFT JOIN users u ON ul.user_id = u.id WHERE ul.id = ?',
    [learnlistId],
    (err, results) => {
      if (err) {
        console.error('Error retrieving learnlist:', err);
        return res.status(500).render('error', { message: 'Error retrieving learnlist.' });
      }
      if (results.length === 0) {
        return res.status(404).render('error', { message: 'Learnlist not found.' });
      }
      const learnlist = results[0];
      pool.query(
        'SELECT * FROM resources INNER JOIN user_learnlist_resources ON resources.id = user_learnlist_resources.resource_id WHERE user_learnlist_resources.user_learnlist_id = ?',
        [learnlistId],
        (err, resourceResults) => {
          if (err) {
            console.error('Error retrieving resources:', err);
            return res.status(500).render('error', { message: 'Error retrieving resources.' });
          }
          pool.query(
            'SELECT * FROM reviews WHERE learnlist_id = ?',
            [learnlistId],
            (err, reviewResults) => {
              if (err) {
                console.error('Error retrieving reviews:', err);
                return res.status(500).render('error', { message: 'Error retrieving reviews.' });
              }
              res.render('learnlist', { learnlist, resources: resourceResults, reviews: reviewResults });
            }
          );
        }
      );
    }
  );
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
