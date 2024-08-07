require("dotenv").config();
const express = require("express");
const mysql = require("mysql");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const path = require("path");

const app = express();

// middleware
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

// connection setup
const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PW,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

// check connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error("Database connection failed: " + err.stack);
    return;
  }
  console.log("Connected to MySQL database");
  connection.release();
});

// check if user is authenticated
function isAuthenticated(req, res, next) {
  console.log("Checking authentication for session: ", req.session); 
  if (req.session.user) {
    console.log("User is authenticated: ", req.session.user); 
    return next(); 
  }
  console.log("User not authenticated, redirecting to /signin"); 
  res.redirect("/signin"); // redirect to signin if not authenticated
}

// index route
app.get("/", (req, res) => {
  console.log("Index route, session: ", req.session); 
  if (req.session.user) {
    return res.redirect("/home"); // redirect to home if authenticated
  }
  res.redirect("/signup"); // redirect to signup if not authenticated
});

// signup page
app.get("/signup", (req, res) => {
  res.render("signup");
});

// signup form 
app.post("/signup", async (req, res) => {
  const { username, password, email } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  // check if username or email already exists
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
            // successful signup redirect to signin
            res.redirect("/signin");
          }
        );
      }
    }
  );
});

// signin page
app.get("/signin", (req, res) => {
  res.render("signin"); 
});

// signin form submission
app.post("/signin", async (req, res) => {
  const { username, password } = req.body;

  // fetch user from database
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
      // validate password
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
        console.log("Session set: ", req.session.user); 
        res.redirect("/home");
      });
    }
  );
});

// home page if authenticated
app.get("/home", isAuthenticated, (req, res) => {
  console.log("Home route, user in session: ", req.session.user); 
  res.render("home", { user: req.session.user });
});

// logout
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
    }
    res.redirect("/signin"); // redirect to signin
  });
});

// all content
app.get("/all-content", async (req, res) => {
  const { category, resource_type, search, sort } = req.query;

  let query = `
    SELECT resources.*, categories.name AS category_name, resource_types.name AS resource_type_name 
    FROM resources 
    LEFT JOIN categories ON resources.category_id = categories.id
    LEFT JOIN resource_types ON resources.resource_type_id = resource_types.id
    WHERE 1=1
  `;
  let queryParams = [];

  if (category) {
    query += " AND category_id = ?";
    queryParams.push(category);
  }

  if (resource_type) {
    query += " AND resource_type_id = ?";
    queryParams.push(resource_type);
  }

  if (search) {
    query += " AND resources.name LIKE ?";
    queryParams.push("%" + search + "%");
  }

  if (sort) {
    if (sort === "asc") {
      query += " ORDER BY resources.name ASC";
    } else if (sort === "desc") {
      query += " ORDER BY resources.name DESC";
    }
  }

  try {
    const resources = await new Promise((resolve, reject) => {
      pool.query(query, queryParams, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    const categories = await new Promise((resolve, reject) => {
      pool.query("SELECT * FROM categories", (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    const resourceTypes = await new Promise((resolve, reject) => {
      pool.query("SELECT * FROM resource_types", (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    res.render("all-content", {
      resources,
      categories: Array.isArray(categories) ? categories : [],
      resourceTypes: Array.isArray(resourceTypes) ? resourceTypes : [],
      selectedCategory: category || "",
      selectedResourceType: resource_type || "",
      search: search || "",
      sort: sort || ""
    });
  } catch (error) {
    console.error("Error retrieving resources:", error);
    res.status(500).render("error", { message: "Error retrieving resources." });
  }
});

// view all learnlists of a user
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

// view form to create a new learnlist
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

// form submission to create a new learnlist
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

// specific learnlist with rating
app.get('/learnlists/:id', isAuthenticated, (req, res) => {
  const learnlistId = req.params.id;
  const userId = req.session.user.id;

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
        'SELECT resources.* FROM resources INNER JOIN user_learnlist_resources ON resources.id = user_learnlist_resources.resource_id WHERE user_learnlist_resources.user_learnlist_id = ?',
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

              pool.query(
                'SELECT learnlist_id FROM user_favourites WHERE user_id = ?',
                [userId],
                (err, favouriteResults) => {
                  if (err) {
                    console.error('Error retrieving user favourites:', err);
                    return res.status(500).render('error', { message: 'Error retrieving user favourites.' });
                  }

                  const userFavorites = favouriteResults.map(fav => fav.learnlist_id);

                  res.render('learnlist', {
                    learnlist,
                    resources: resourceResults,
                    reviews: reviewResults,
                    userFavorites
                  });
                }
              );
            }
          );
        }
      );
    }
  );
});

// edit a learnlist
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

// update a learnlist
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

// deletion of a learnlist
app.post('/learnlists/:id/delete', isAuthenticated, (req, res) => {
  const learnlistId = req.params.id;
  const userId = req.session.user.id;
  
  // delete references in the user_favourites table
  pool.query(
    'DELETE FROM user_favourites WHERE learnlist_id = ?',
    [learnlistId],
    (err, result) => {
      if (err) {
        console.error('Error deleting from user_favourites:', err);
        return res.status(500).render('error', { message: 'Error deleting references in user_favourites.' });
      }
      
      // delete the learnlist
      pool.query(
        'DELETE FROM user_learnlists WHERE id = ? AND user_id = ?',
        [learnlistId, userId],
        (err, result) => {
          if (err) {
            console.error('Error deleting learnlist:', err);
            return res.status(500).render('error', { message: 'Error deleting learnlist.' });
          }
          res.redirect('/learnlists');
        }
      );
    }
  );
});



// review for a learnlist
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


// learnlists of all users
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

// displaying the form to create a new learnlist
app.get("/learnlists/new", isAuthenticated, async (req, res) => {
  try {
    const resources = await new Promise((resolve, reject) => {
      pool.query("SELECT * FROM resources", (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
    res.render("new-learnlist", { resources });
  } catch (err) {
    console.error("Error retrieving resources:", err);
    res.status(500).render("error", { message: "Error retrieving resources." });
  }
});

// create a new learnlist
app.post("/learnlists", isAuthenticated, (req, res) => {
  const { name, description, resources } = req.body;
  const userId = req.session.user.id;
  pool.query(
    "INSERT INTO user_learnlists (user_id, name, description) VALUES (?, ?, ?)",
    [userId, name, description],
    (err, result) => {
      if (err) {
        console.error("Error creating learnlist:", err);
        return res.status(500).render("error", { message: "Error creating learnlist." });
      }
      const learnlistId = result.insertId;
      if (resources) {
        const resourceIds = Array.isArray(resources) ? resources : [resources];
        const learnlistResources = resourceIds.map((resourceId) => [learnlistId, resourceId]);
        pool.query(
          "INSERT INTO user_learnlist_resources (user_learnlist_id, resource_id) VALUES ?",
          [learnlistResources],
          (err) => {
            if (err) {
              console.error("Error adding resources to learnlist:", err);
              return res.status(500).render("error", { message: "Error adding resources to learnlist." });
            }
            res.redirect("/learnlists");
          }
        );
      } else {
        res.redirect("/learnlists");
      }
    }
  );
});

// learnlist to favourites
app.post('/learnlists/:id/favourite', isAuthenticated, (req, res) => {
  const learnlistId = req.params.id;
  const userId = req.session.user.id;

  pool.query(
    'INSERT INTO user_favourites (user_id, learnlist_id) VALUES (?, ?)',
    [userId, learnlistId],
    (err) => {
      if (err) {
        console.error('Error adding favourite learnlist:', err);
        return res.status(500).render('error', { message: 'Error adding favourite learnlist.' });
      }
      res.redirect(`/learnlists/${learnlistId}`);
    }
  );
});

// learnlist from favourites
app.post('/learnlists/:id/unfavourite', isAuthenticated, (req, res) => {
  const learnlistId = req.params.id;
  const userId = req.session.user.id;

  pool.query(
    'DELETE FROM user_favourites WHERE user_id = ? AND learnlist_id = ?',
    [userId, learnlistId],
    (err) => {
      if (err) {
        console.error('Error removing favourite learnlist:', err);
        return res.status(500).render('error', { message: 'Error removing favourite learnlist.' });
      }
      res.redirect(`/learnlists/${learnlistId}`);
    }
  );
});

app.get('/favourites', isAuthenticated, (req, res) => {
  const userId = req.session.user.id;

  pool.query(
    `SELECT ul.*, u.username, COALESCE(AVG(r.rating), 0) AS average_rating
     FROM user_favourites uf
     JOIN user_learnlists ul ON uf.learnlist_id = ul.id
     JOIN users u ON ul.user_id = u.id
     LEFT JOIN reviews r ON ul.id = r.learnlist_id
     WHERE uf.user_id = ?
     GROUP BY ul.id`,
    [userId],
    (err, results) => {
      if (err) {
        console.error('Error retrieving favourite learnlists:', err);
        return res.status(500).render('error', { message: 'Error retrieving favourite learnlists.' });
      }
      res.render('favourites', { favouriteLearnlists: results });
    }
  );
});

// start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}/all-content`);
});
